import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ShoppingCart, Heart, User, Menu, X, Plus, Minus, Trash2, Upload } from "lucide-react";
import "@/App.css";

import Register from "./components/ui/register";
import VerifyEmail from "./components/ui/verifyEmail";
import Login from "./components/ui/login";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://18.205.19.24:8081";
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved && saved !== "undefined" ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      if (!user) fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/auth/me`);
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (err) {
      console.error("fetch user failed", err);
      logout();
    }
  };

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// ✅ Navbar
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user) fetchCartCount();
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await axios.get(`${API}/cart`);
      setCartCount(res.data.length);
    } catch (err) {
      console.error("cart load failed", err);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#8B1538]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-[#8B1538]">Pradha</span>
            <span className="text-lg text-gray-600">Fashion Outlet</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Collections</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>

            {user?.role === "ADMIN" && (
              <Link to="/admin" className="nav-link">Admin</Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-gray-100 rounded-full">
                  <ShoppingCart className="w-5 h-5 text-[#8B1538]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#DAA520] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                <Button variant="ghost" onClick={logout} className="text-[#8B1538]">Logout</Button>
              </>
            ) : (
              <Button onClick={() => navigate("/login")} className="bg-[#8B1538] hover:bg-[#6B0F2A] text-white">
                Login
              </Button>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Collections</Link>
            <Link to="/about" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
            <Link to="/contact" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</Link>

            {user?.role === "ADMIN" && (
              <Link to="/admin" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
            )}

            {user ? (
              <>
                <Link to="/cart" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Cart ({cartCount})
                </Link>
                <button onClick={logout} className="block nav-link w-full text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

  const fetchNewArrivals = async () => {
    try {
      const response = await axios.get(`${API}/products?new_arrival=true`);
      setNewArrivals(response.data.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch new arrivals:', error);
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">Pradha Fashion Outlet</h1>
            <p className="hero-subtitle">Where Tradition Meets Elegance</p>
            <div className="flex gap-4 justify-center mt-8">
              <Button
                onClick={() => navigate('/products')}
                className="hero-btn"
                data-testid="shop-now-btn"
              >
                Shop Now
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                variant="outline"
                className="hero-btn-outline"
                data-testid="customize-btn"
              >
                Customize Your Outfit
              </Button>
            </div>
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="section-container">
          <h2 className="section-title">Featured Products</h2>
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <section className="section-container bg-[#F5F5DC]/20">
          <h2 className="section-title">New Arrivals</h2>
          <div className="product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="section-container">
        <h2 className="section-title">Our Collections</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div
            className="collection-card women-collection"
            onClick={() => navigate('/products?category=Women')}
          >
            <div className="collection-overlay">
              <h3 className="collection-title">Women's Collection</h3>
              <p className="collection-subtitle">Lehenga • Blouses • Dresses</p>
            </div>
          </div>
          <div
            className="collection-card men-collection"
            onClick={() => navigate('/products?category=Men')}
          >
            <div className="collection-overlay">
              <h3 className="collection-title">Men's Collection</h3>
              <p className="collection-subtitle">Khadi • Kurta • T-Shirts</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  return (
    <Card
      className="product-card cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
      data-testid={`product-card-${product.id}`}
    >
      <div className="product-image-container">
        <img
          src={product.images[0] || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="product-image"
        />
        {product.new_arrival && (
          <Badge className="absolute top-2 left-2 bg-[#DAA520] hover:bg-[#B8860B]">New</Badge>
        )}
        {product.featured && (
          <Badge className="absolute top-2 right-2 bg-[#8B1538] hover:bg-[#6B0F2A]">Featured</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>{product.subcategory}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <span className="text-xl font-bold text-[#8B1538]">₹{product.price}</span>
        {product.customizable && (
          <Badge variant="outline" className="text-[#DAA520] border-[#DAA520]">
            Customizable
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [subcategory, setSubcategory] = useState('All');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, category, subcategory]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    if (subcategory !== 'All') {
      filtered = filtered.filter(p => p.subcategory === subcategory);
    }
    setFilteredProducts(filtered);
  };

  const subcategories = category === 'Women'
    ? ['All', 'Lehenga', 'Blouse', 'Dresses']
    : category === 'Men'
    ? ['All', 'Khadi', 'Kurta', 'T-Shirt']
    : ['All'];

  return (
    <div className="page-container">
      <h1 className="page-title">Our Collections</h1>

      <div className="filters-container">
        <div className="filter-group">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="category-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Women">Women</SelectItem>
              <SelectItem value="Men">Men</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="filter-group">
          <Label>Subcategory</Label>
          <Select value={subcategory} onValueChange={setSubcategory}>
            <SelectTrigger data-testid="subcategory-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map(sub => (
                <SelectItem key={sub} value={sub}>{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customizationNotes, setCustomizationNotes] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      if (response.data.sizes.length > 0) setSelectedSize(response.data.sizes[0]);
      if (response.data.colors.length > 0) setSelectedColor(response.data.colors[0]);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      navigate('/products');
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await axios.post(`${API}/cart`, {
        product_id: product.id,
        quantity,
        size: selectedSize,
        color: selectedColor,
        customization_notes: customizationNotes || null
      });
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (!product) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div className="space-y-4">
          <div className="product-detail-image-container">
            <img
              src={product.images[0] || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="product-detail-image"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${product.name} ${idx + 2}`}
                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Badge className="mb-2">{product.category}</Badge>
            <h1 className="text-4xl font-bold text-[#8B1538] mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-[#DAA520]">₹{product.price}</p>
          </div>

          <p className="text-gray-600">{product.description}</p>

          {user ? (
            <>
              <div className="space-y-4">
                <div>
                  <Label>Size</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger data-testid="size-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.sizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Color</Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger data-testid="color-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {product.colors.map(color => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      data-testid="decrease-quantity-btn"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                      data-testid="increase-quantity-btn"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {product.customizable && (
                  <div>
                    <Label>Customization Notes (Optional)</Label>
                    <Textarea
                      placeholder="Any specific stitching requirements or design preferences..."
                      value={customizationNotes}
                      onChange={(e) => setCustomizationNotes(e.target.value)}
                      className="mt-2"
                      data-testid="customization-notes"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white py-6 text-lg"
                data-testid="add-to-cart-btn"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">Please login to customize and purchase this item</p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-[#8B1538] hover:bg-[#6B0F2A] text-white"
              >
                Login to Shop
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart`);
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.put(`${API}/cart/${itemId}?quantity=${newQuantity}`);
      fetchCart();
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await axios.delete(`${API}/cart/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  if (loading) return <div className="page-container">Loading...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/products')} className="bg-[#8B1538] hover:bg-[#6B0F2A]">
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} data-testid={`cart-item-${item.id}`}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Size: {item.size} | Color: {item.color}
                      </p>
                      {item.customization_notes && (
                        <p className="text-sm text-gray-500 italic">Notes: {item.customization_notes}</p>
                      )}
                      <p className="text-lg font-bold text-[#8B1538] mt-2">₹{item.product?.price}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        data-testid={`remove-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{total}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Items:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold text-[#8B1538]">
                    <span>Total:</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#DAA520] hover:bg-[#B8860B] text-white py-6 text-lg"
                  onClick={() => toast.info('Checkout feature coming soon!')}
                  data-testid="checkout-btn"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const AboutPage = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">About Pradha Fashion Outlet</h1>
      <div className="max-w-4xl mx-auto space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          Welcome to <span className="font-semibold text-[#8B1538]">Pradha Fashion Outlet</span>, where tradition meets elegance.
          We are a premier boutique dedicated to providing exquisite traditional and modern fashion wear for both women and men.
        </p>
        <p>
          Our boutique specializes in customization, ensuring that every piece of clothing reflects your unique style and personality.
          Whether you're looking for a stunning lehenga for a wedding, a perfectly tailored blouse, or elegant ethnic wear for men,
          we have you covered.
        </p>
        <h2 className="text-2xl font-semibold text-[#8B1538] mt-8 mb-4">Our Mission</h2>
        <p>
          At Pradha Fashion Outlet, our mission is to blend traditional Indian craftsmanship with contemporary fashion sensibilities.
          We believe that every garment tells a story, and we're here to help you tell yours with elegance and grace.
        </p>
        <h2 className="text-2xl font-semibold text-[#8B1538] mt-8 mb-4">What We Offer</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#F5F5DC]/30 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-[#8B1538]">Women's Collection</h3>
            <ul className="space-y-2 text-sm">
              <li>• Lehenga for festivals and weddings with customization</li>
              <li>• Designer blouses tailored to your requirements</li>
              <li>• One-piece and three-piece dresses</li>
              <li>• Traditional and contemporary ethnic wear</li>
            </ul>
          </div>
          <div className="p-6 bg-[#F5DEB3]/30 rounded-lg">
            <h3 className="font-semibold text-xl mb-2 text-[#8B1538]">Men's Collection</h3>
            <ul className="space-y-2 text-sm">
              <li>• Premium Khadi wear collection</li>
              <li>• Traditional kurtas for all occasions</li>
              <li>• Modern printed t-shirts</li>
              <li>• Ethnic and casual outfits</li>
            </ul>
          </div>
        </div>
        <p className="text-center italic mt-8 text-[#8B1538]">
          "Your satisfaction is our success. Let us help you look your best!"
        </p>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/inquiries`, formData);
      toast.success('Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      toast.error('Failed to submit inquiry');
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Contact Us</h1>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
            <CardDescription>
              Have a question or want to discuss customization? Send us a message!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="contact-name-input"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="contact-email-input"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="contact-phone-input"
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  data-testid="contact-message-input"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#8B1538] hover:bg-[#6B0F2A] text-white"
                data-testid="contact-submit-btn"
              >
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <h3 className="text-xl font-semibold text-[#8B1538]">Connect With Us</h3>
          <div className="flex justify-center space-x-6">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              Facebook
            </a>
            <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="social-icon">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
  }, [user, navigate]);
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Women',
    subcategory: 'Lehenga',
    description: '',
    price: '',
    sizes: '',
    colors: '',
    images: [],
    customizable: true,
    featured: false,
    new_arrival: false
  });

  useEffect(() => {
    fetchProducts();
    fetchInquiries();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(`${API}/admin/inquiries`);
      setInquiries(response.data);
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    }
  };

  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ✅ Set category & subcategory — modify based on your form state
  const category = formData.category || "default";
  const subcategory = formData.subcategory || "default";

  const formDataUpload = new FormData();
  formDataUpload.append("file", file);
  formDataUpload.append("category", category);
  formDataUpload.append("subcategory", subcategory);

  try {
    const response = await axios.post(
      `${API}/auth/upload-image`,
      formDataUpload,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setFormData({
      ...formData,
      images: [...formData.images, response.data.url]
    });

    toast.success("Image uploaded!");
  } catch (error) {
    console.error("Failed to upload image:", error);
    toast.error("Failed to upload image");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      sizes: formData.sizes.split(',').map(s => s.trim()),
      colors: formData.colors.split(',').map(c => c.trim())
    };

    try {
      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, productData);
        toast.success('Product updated!');
      } else {
        await axios.post(`${API}/admin/products`, productData);
        toast.success('Product created!');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      description: product.description,
      price: product.price.toString(),
      sizes: product.sizes.join(', '),
      colors: product.colors.join(', '),
      images: product.images,
      customizable: product.customizable,
      featured: product.featured,
      new_arrival: product.new_arrival
    });
    setShowProductForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API}/admin/products/${productId}`);
      toast.success('Product deleted!');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Women',
      subcategory: 'Lehenga',
      description: '',
      price: '',
      sizes: '',
      colors: '',
      images: [],
      customizable: true,
      featured: false,
      new_arrival: false
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  return (
    <div className="page-container" data-testid="admin-dashboard">
      <h1 className="page-title">Admin Dashboard</h1>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="products" data-testid="products-tab">Products</TabsTrigger>
          <TabsTrigger value="inquiries" data-testid="inquiries-tab">Inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowProductForm(!showProductForm)}
              className="bg-[#8B1538] hover:bg-[#6B0F2A]"
              data-testid="add-product-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {showProductForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Product Name *</Label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="product-name-input"
                      />
                    </div>
                    <div>
                      <Label>Price (₹) *</Label>
                      <Input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        data-testid="product-price-input"
                      />
                    </div>
                    <div>
                      <Label>Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger data-testid="product-category-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Women">Women</SelectItem>
                          <SelectItem value="Men">Men</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Subcategory *</Label>
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                      >
                        <SelectTrigger data-testid="product-subcategory-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.category === 'Women' ? (
                            <>
                              <SelectItem value="Lehenga">Lehenga</SelectItem>
                              <SelectItem value="Blouse">Blouse</SelectItem>
                              <SelectItem value="Dresses">Dresses</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Khadi">Khadi</SelectItem>
                              <SelectItem value="Kurta">Kurta</SelectItem>
                              <SelectItem value="T-Shirt">T-Shirt</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sizes (comma separated) *</Label>
                      <Input
                        required
                        placeholder="S, M, L, XL"
                        value={formData.sizes}
                        onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                        data-testid="product-sizes-input"
                      />
                    </div>
                    <div>
                      <Label>Colors (comma separated) *</Label>
                      <Input
                        required
                        placeholder="Red, Blue, Green"
                        value={formData.colors}
                        onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                        data-testid="product-colors-input"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      data-testid="product-description-input"
                    />
                  </div>

                  <div>
                    <Label>Product Images</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                        data-testid="product-image-upload"
                      />
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mt-4">
                        {formData.images.map((img, idx) => (
                          <div key={idx} className="relative">
                            <img src={img} alt={`Product ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== idx) })}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.customizable}
                        onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                        data-testid="product-customizable-checkbox"
                      />
                      <span>Customizable</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        data-testid="product-featured-checkbox"
                      />
                      <span>Featured</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.new_arrival}
                        onChange={(e) => setFormData({ ...formData, new_arrival: e.target.checked })}
                        data-testid="product-newarrival-checkbox"
                      />
                      <span>New Arrival</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#8B1538] hover:bg-[#6B0F2A]" data-testid="save-product-btn">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} data-testid="cancel-product-btn">
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <Card key={product.id} data-testid={`admin-product-${product.id}`}>
                <CardContent className="p-4">
                  <img
                    src={product.images[0] || 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category} - {product.subcategory}</p>
                  <p className="text-lg font-bold text-[#8B1538] mb-3">₹{product.price}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      data-testid={`edit-product-${product.id}`}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      data-testid={`delete-product-${product.id}`}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inquiries">
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} data-testid={`inquiry-${inquiry.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{inquiry.name}</CardTitle>
                  <CardDescription>
                    {inquiry.email} {inquiry.phone && `• ${inquiry.phone}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{inquiry.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
            {inquiries.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No inquiries yet
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#8B1538] text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Pradha Fashion Outlet</h3>
            <p className="text-gray-200">Where Tradition Meets Elegance</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block hover:text-[#DAA520] transition-colors">Home</Link>
              <Link to="/products" className="block hover:text-[#DAA520] transition-colors">Collections</Link>
              <Link to="/about" className="block hover:text-[#DAA520] transition-colors">About</Link>
              <Link to="/contact" className="block hover:text-[#DAA520] transition-colors">Contact</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="space-y-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#DAA520] transition-colors">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="block hover:text-[#DAA520] transition-colors">Facebook</a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="block hover:text-[#DAA520] transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-200">
          <p>© 2025 Pradha Fashion Outlet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }) => {
  return (
    <div className="App">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
          <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />
          <Route path="/cart" element={<Layout><CartPage /></Layout>} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/admin" element={<Layout><AdminPage /></Layout>} />

          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
