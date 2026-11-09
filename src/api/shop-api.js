import { callRpc } from './rpc';

/** 좋아요 */
export const toggleLike = (token, productId) => callRpc('toggle_like', { p_token: token, p_product_id: productId });

export const getLikedProducts = (token) => callRpc('get_liked_products', { p_token: token });

/** 장바구니 */
export const getCart = (token) => callRpc('get_cart', { p_token: token });

export const addToCart = (token, optionId, quantity = 1) => callRpc('add_to_cart', {
  p_token: token,
  p_option_id: optionId,
  p_quantity: quantity,
});

export const updateCartItem = (token, cartItemId, quantity) => callRpc('update_cart_item', {
  p_token: token,
  p_cart_item_id: cartItemId,
  p_quantity: quantity,
});

export const removeCartItem = (token, cartItemId) => callRpc('remove_cart_item', {
  p_token: token,
  p_cart_item_id: cartItemId,
});

/** 배송지 */
export const getAddresses = (token) => callRpc('get_addresses', { p_token: token });

export const addAddress = (token, roadAddress, detailAddress) => callRpc('add_address', {
  p_token: token,
  p_road_address: roadAddress,
  p_detail_address: detailAddress,
  p_address_name: '배송지',
  p_is_default: false,
});

export const deleteAddress = (token, addressId) => callRpc('delete_address', {
  p_token: token,
  p_address_id: addressId,
});

export const setDefaultAddress = (token, addressId) => callRpc('set_default_address', {
  p_token: token,
  p_address_id: addressId,
});

/** 주문 */
export const createOrder = (token, { items, addressId, paymentMethod, cartItemIds }) => callRpc('create_order', {
  p_token: token,
  p_items: items.map((item) => ({ option_id: item.option_id, quantity: item.quantity })),
  p_address_id: addressId,
  p_payment_method: paymentMethod,
  p_cart_item_ids: cartItemIds && cartItemIds.length ? cartItemIds : null,
});

export const getOrders = (token) => callRpc('get_orders', { p_token: token });

export const hasPurchased = (token, productId) => callRpc('has_purchased', {
  p_token: token,
  p_product_id: productId,
});
