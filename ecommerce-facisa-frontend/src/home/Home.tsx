import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Home.css";

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
}

interface Promotion {
  _id: string;
  product: Product;
  discountPercentage: number;
  startDate: string;
  endDate: string;
}

export default function Home() {
  const navigate = useNavigate();

  const [recommended, setRecommended] = useState<Product[]>([]);
  const [others, setOthers] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // buscar produtos (com token se houver para recomendações), buscar promoções somente se logado
        const prodReq = token
          ? axios.get("http://localhost:3000/api/products", { headers: { Authorization: `Bearer ${token}` } })
          : axios.get("http://localhost:3000/api/products");

        let promosReq = Promise.resolve({ data: [] as any });
        if (token) {
          promosReq = axios.get("http://localhost:3000/api/promotions", { headers: { Authorization: `Bearer ${token}` } });
        }

        const [productsRes, promosRes] = await Promise.all([prodReq, promosReq]);

        const productsData = productsRes.data;
        if (productsData.recommended || productsData.others) {
          setRecommended(productsData.recommended || []);
          setOthers(productsData.others || []);
        } else if (Array.isArray(productsData)) {
          setOthers(productsData);
        }

        const promosData = promosRes.data || [];
        setPromotions(promosData);

      } catch (error: any) {
        console.error("Erro ao buscar dados:", error);
        // If token is invalid or expired, remove it silently and continue as visitor
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          localStorage.removeItem("token");
          // do not navigate or show blocking alerts here; Home is public
          setPromotions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) return <p className="home-loading">Carregando ofertas...</p>;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const filtered = (list: Product[]) => {
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

  const imageUrl = (img?: string) => {
    if (!img) return undefined;
    if (img.startsWith('http')) return img;
    return `http://localhost:3000${img}`;
  };

  return (
    <div className="home-page">
      <nav className="home-nav">
        <div className="nav-left">
          <h1 className="brand">
            <svg className="brand-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M6 6h15l-1.5 9h-11L6 6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
              <circle cx="10" cy="19" r="1" fill="currentColor" />
              <circle cx="18" cy="19" r="1" fill="currentColor" />
            </svg>
            Supermercado Array
          </h1>
        </div>
        <div className="nav-right">
          <input className="search-input" placeholder="Busque produtos, marcas ou categorias" value={query} onChange={(e) => setQuery(e.target.value)} />
          {localStorage.getItem('token') ? (
            <button className="nav-button" onClick={handleLogout}>Sair</button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="nav-button" onClick={() => navigate('/login')}>Entrar</button>
              <button className="nav-button" onClick={() => navigate('/signup')}>Criar Conta</button>
            </div>
          )}
        </div>
      </nav>

      <main className="home-content">
        <section className="hero">
          <div>
            <h2>Crie sua conta e desbloqueie descontos exclusivos!</h2>
            <p>Cadastre-se em segundos e aproveite cupons, promoções e ofertas personalizadas para economizar nas suas compras.</p>
          </div>
          <div>
            <button className="cta" onClick={() => {
              const token = localStorage.getItem('token');
              if (token) navigate('/home'); else navigate('/login');
            }}>Ver Ofertas</button>
          </div>
        </section>

        {promotions.length > 0 && (
          <section className="promo-band">
            <h3>Promoções</h3>
            <div className="product-row">
              {promotions.map((promo) => {
                const product = promo.product;
                const discounted = +(product.price * (1 - promo.discountPercentage / 100)).toFixed(2);
                return (
                  <article key={promo._id} className="product-card promo">
                    <div className="product-media" aria-hidden>
                      {product.image ? (
                        <img src={imageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className="thumb">Img</div>
                      )}
                    </div>
                    <div className="product-body">
                      <h4>{product.name}</h4>
                      <p className="muted">{product.description}</p>
                      <div className="prices">
                        <span className="old">{formatCurrency(product.price)}</span>
                        <span className="new">{formatCurrency(discounted)}</span>
                      </div>
                      <button className="buy">Comprar</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {recommended.length > 0 && (
          <section>
            <h3>Recomendados</h3>
            <div className="product-grid">
              {filtered(recommended).map((product) => (
                <article key={product._id} className="product-card">
                  <div className="product-media">{product.image ? <img src={imageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="thumb">Img</div>}</div>
                  <div className="product-body">
                    <h4>{product.name}</h4>
                    <p className="muted">{product.description}</p>
                    <div className="prices"><span className="new">{formatCurrency(product.price)}</span></div>
                    <button className="buy">Comprar</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3>Todos os Produtos</h3>
          <div className="product-grid">
            {filtered(others).map((product) => (
              <article key={product._id} className="product-card">
                <div className="product-media">{product.image ? <img src={imageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="thumb">Img</div>}</div>
                <div className="product-body">
                  <h4>{product.name}</h4>
                  <p className="muted">{product.description}</p>
                  <div className="prices"><span className="new">{formatCurrency(product.price)}</span></div>
                  <button className="buy">Comprar</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}