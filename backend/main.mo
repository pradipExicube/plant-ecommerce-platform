import Array "mo:core/Array";
import Map "mo:core/Map";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Char "mo:core/Char";
import Principal "mo:core/Principal";
import Nat64 "mo:core/Nat64";
import OutCall "http-outcalls/outcall";
import Stripe "stripe/stripe";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Product = {
    id : Nat;
    name : Text;
    slug : Text;
    description : Text;
    images : [Text];
    category : Text;
    price : Nat;
    stock : Nat;
    specifications : [(Text, Text)];
    variants : [Text];
  };

  module Product {
    func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.price, product2.price);
    };

    func compareByName(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.name, product2.name);
    };
  };

  type Category = {
    id : Nat;
    name : Text;
    slug : Text;
    parentCategory : ?Nat;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type Cart = {
    items : [CartItem];
  };

  type Address = {
    id : Nat;
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
  };

  type WishlistItem = {
    productId : Nat;
  };

  type Review = {
    userId : Principal;
    productId : Nat;
    rating : Nat;
    comment : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  public type ShoppingItem = Stripe.ShoppingItem;

  public type StripeSessionStatus = Stripe.StripeSessionStatus;

  var productIdCounter = 1;
  var categoryIdCounter = 1;
  var addressIdCounter = 1;
  var orderIdCounter = 1;

  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, Category>();
  let carts = Map.empty<Principal, Cart>();
  let addresses = Map.empty<Principal, [Address]>();
  let wishlists = Map.empty<Principal, [WishlistItem]>();
  let reviews = Map.empty<Nat, [Review]>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── User Profile ────────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── Product helpers ─────────────────────────────────────────────────────────

  func saveProduct(product : Product) : () {
    products.add(product.id, product);
  };

  func saveCategory(category : Category) : () {
    categories.add(category.id, category);
  };

  func filterProductsByCategory(categoryName : Text) : [Product] {
    let productsIter = products.values();
    let filteredProducts = productsIter.filter(
      func(product) {
        Text.equal(product.category, categoryName);
      }
    );
    filteredProducts.toArray();
  };

  func filterProductsByPriceRange(minPrice : Nat, maxPrice : Nat) : [Product] {
    let productsIter = products.values();
    let filteredProducts = productsIter.filter(
      func(product) {
        product.price >= minPrice and product.price <= maxPrice
      }
    );
    filteredProducts.toArray();
  };

  type CreateProductPayload = {
    name : Text;
    slug : Text;
    description : Text;
    images : [Text];
    category : Text;
    price : Nat;
    stock : Nat;
    specifications : [(Text, Text)];
    variants : [Text];
  };

  type CreateCategoryPayload = {
    name : Text;
    slug : Text;
    parentCategory : ?Nat;
  };

  // ─── Product CRUD (admin only) ────────────────────────────────────────────────

  public shared ({ caller }) func createProduct(payload : CreateProductPayload) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };

    let product : Product = {
      id = productIdCounter;
      name = payload.name;
      slug = payload.slug;
      description = payload.description;
      images = payload.images;
      category = payload.category;
      price = payload.price;
      stock = payload.stock;
      specifications = payload.specifications;
      variants = payload.variants;
    };

    saveProduct(product);
    productIdCounter += 1;
  };

  public shared ({ caller }) func updateProduct(payload : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };

    if (not products.containsKey(payload.id)) {
      Runtime.trap("Product not found");
    };

    saveProduct(payload);
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };

    if (not products.containsKey(productId)) {
      Runtime.trap("Product not found");
    };

    products.remove(productId);
  };

  // ─── Category CRUD (admin only) ───────────────────────────────────────────────

  public shared ({ caller }) func createCategory(payload : CreateCategoryPayload) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };

    let category : Category = {
      id = categoryIdCounter;
      name = payload.name;
      slug = payload.slug;
      parentCategory = payload.parentCategory;
    };

    saveCategory(category);
    categoryIdCounter += 1;
  };

  public shared ({ caller }) func updateCategory(payload : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };

    if (not categories.containsKey(payload.id)) {
      Runtime.trap("Category not found");
    };

    saveCategory(payload);
  };

  public shared ({ caller }) func deleteCategory(categoryId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };

    if (not categories.containsKey(categoryId)) {
      Runtime.trap("Category not found");
    };

    categories.remove(categoryId);
  };

  // ─── Public product queries (no auth required) ────────────────────────────────

  public query ({ caller }) func getProducts() : async [Product] {
    let productsIter = products.values();
    productsIter.toArray();
  };

  public query ({ caller }) func getCategories() : async [Category] {
    let categoriesIter = categories.values();
    categoriesIter.toArray();
  };

  public query ({ caller }) func getProductBySlug(slug : Text) : async ?Product {
    let productsIter = products.values();
    let filtered = productsIter.filter(func(p) { Text.equal(p.slug, slug) });
    let arr = filtered.toArray();
    if (arr.size() == 0) { null } else { ?arr[0] };
  };

  public query ({ caller }) func searchProducts(searchText : Text) : async [Product] {
    findByNameAndSort(searchText, func(a, b) { Text.compare(a.name, b.name) });
  };

  public query ({ caller }) func getProductsByCategory(categoryName : Text) : async [Product] {
    filterProductsByCategory(categoryName);
  };

  public query ({ caller }) func getProductsByPriceRange(minPrice : Nat, maxPrice : Nat) : async [Product] {
    filterProductsByPriceRange(minPrice, maxPrice);
  };

  // ─── Cart (authenticated users only) ─────────────────────────────────────────

  public query ({ caller }) func getCart() : async Cart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their cart");
    };
    switch (carts.get(caller)) {
      case (?cart) { cart };
      case (null) { { items = [] } };
    };
  };

  public shared ({ caller }) func updateCart(cart : Cart) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their cart");
    };
    carts.add(caller, cart);
  };

  public shared ({ caller }) func clearCart() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear their cart");
    };
    carts.add(caller, { items = [] });
  };

  // ─── Addresses (authenticated users only) ────────────────────────────────────

  public query ({ caller }) func getAddresses() : async [Address] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their addresses");
    };
    switch (addresses.get(caller)) {
      case (?addrs) { addrs };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addAddress(address : Address) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add addresses");
    };
    let newAddress : Address = {
      id = addressIdCounter;
      street = address.street;
      city = address.city;
      state = address.state;
      zip = address.zip;
      country = address.country;
    };
    let current = switch (addresses.get(caller)) {
      case (?addrs) { addrs };
      case (null) { [] };
    };
    addresses.add(caller, current.concat([newAddress]));
    addressIdCounter += 1;
    newAddress.id;
  };

  public shared ({ caller }) func updateAddress(updated : Address) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their addresses");
    };
    let current = switch (addresses.get(caller)) {
      case (?addrs) { addrs };
      case (null) { Runtime.trap("Address not found") };
    };
    let newList = current.map(
      func(a) { if (a.id == updated.id) { updated } else { a } },
    );
    addresses.add(caller, newList);
  };

  public shared ({ caller }) func deleteAddress(addressId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete their addresses");
    };
    let current = switch (addresses.get(caller)) {
      case (?addrs) { addrs };
      case (null) { [] };
    };
    let newList = current.filter(func(a) { a.id != addressId });
    addresses.add(caller, newList);
  };

  // ─── Wishlist (authenticated users only) ─────────────────────────────────────

  public query ({ caller }) func getWishlist() : async [WishlistItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their wishlist");
    };
    switch (wishlists.get(caller)) {
      case (?items) { items };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addToWishlist(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their wishlist");
    };
    let current = switch (wishlists.get(caller)) {
      case (?items) { items };
      case (null) { [] };
    };
    // Avoid duplicates
    let exists = current.filter(func(i) { i.productId == productId });
    if (exists.size() == 0) {
      wishlists.add(caller, current.concat([{ productId = productId }]));
    };
  };

  public shared ({ caller }) func removeFromWishlist(productId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage their wishlist");
    };
    let current = switch (wishlists.get(caller)) {
      case (?items) { items };
      case (null) { [] };
    };
    let newList = current.filter(func(i) { i.productId != productId });
    wishlists.add(caller, newList);
  };

  // ─── Reviews (read: public; write: authenticated users only) ─────────────────

  public query ({ caller }) func getReviews(productId : Nat) : async [Review] {
    switch (reviews.get(productId)) {
      case (?r) { r };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func addReview(productId : Nat, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };
    let review : Review = {
      userId = caller;
      productId = productId;
      rating = rating;
      comment = comment;
    };
    let current = switch (reviews.get(productId)) {
      case (?r) { r };
      case (null) { [] };
    };
    reviews.add(productId, current.concat([review]));
  };

  public shared ({ caller }) func deleteReview(productId : Nat, reviewerPrincipal : Principal) : async () {
    // Users can delete their own reviews; admins can delete any review
    if (caller != reviewerPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own reviews");
    };
    let current = switch (reviews.get(productId)) {
      case (?r) { r };
      case (null) { [] };
    };
    let newList = current.filter(func(r) { r.userId != reviewerPrincipal });
    reviews.add(productId, newList);
  };

  // ─── Stripe / Checkout (authenticated users only) ────────────────────────────

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe needs to be first configured") };
      case (?value) { value };
    };
  };

  public query ({ caller }) func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can set stripe config");
    };
    stripeConfig := ?config;
  };

  public shared ({ caller }) func createCheckoutSession(items : [ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  func findByNameAndSort(searchText : Text, sortBy : (Product, Product) -> Order.Order) : [Product] {
    let productsIter = products.values();
    let filtered = productsIter.filter(
      func(product) {
        product.name.toLower().contains(
          #text(searchText.toLower()),
        );
      }
    );
    filtered.toArray().sort(sortBy);
  };
};
