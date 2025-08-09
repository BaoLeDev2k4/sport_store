import { useCart } from '../context/CartContext';
import '../scss/_cart.scss';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const totalPrice = cart.reduce(
    (sum, item) => sum + (item.variant?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="cart-container">
      <h2>Giỏ hàng</h2>
      {cart.length === 0 ? (
        <p>Chưa có sản phẩm nào trong giỏ hàng.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Giá</th>
                <th>Số lượng</th>
                <th>Tổng</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => {
                const price = item.variant?.price || 0;
                const maxQty = item.variant?.quantity || 99;
                const image = item.variant?.image
                  ? `/images/products/${item.variant.image}`
                  : '/default.jpg';
                const key = `${item.product._id}-${item.selectedColor}-${item.selectedSize}`;
                return (
                  <tr key={key}>
                    <td>
                      <img src={image} alt={item.product.name} />
                      <div>
                        <div>{item.product.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>
                          Màu: <strong>{item.selectedColor}</strong> | Size: <strong>{item.selectedSize}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{price.toLocaleString()}₫</td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value);
                          if (newQty > maxQty) {
                            alert(
                              `Sản phẩm "${item.product.name}" (Màu: ${item.selectedColor}, Size: ${item.selectedSize}) chỉ còn tối đa ${maxQty} sản phẩm!`
                            );
                            return;
                          }
                          updateQuantity(item.product._id, item.selectedColor, item.selectedSize, newQty);
                        }}
                      />
                    </td>
                    <td>{(price * item.quantity).toLocaleString()}₫</td>
                    <td>
                      <button onClick={() => removeFromCart(item.product._id, item.selectedColor, item.selectedSize)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="total-section">
            <h3>
              Tổng tiền: <span>{totalPrice.toLocaleString()}₫</span>
            </h3>
          </div>

          <div className="checkout-button-wrapper">
            <button className="checkout-button" onClick={() => navigate('/checkout')}>
              Thanh toán
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
