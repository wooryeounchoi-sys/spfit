import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { createReview } from '../api/review-api';
import { getOrders } from '../api/shop-api';
import PageContainer from '../components/common/page-container';
import OrderItemCard from '../components/mypage/order-item-card';
import ReviewDialog from '../components/product/review-dialog';
import PageTitle from '../components/ui/page-title';
import StatusMessage from '../components/ui/status-message';
import useApiError from '../hooks/use-api-error';
import useAuth from '../hooks/use-auth';
import usePopup from '../hooks/use-popup';

/** 주문 목록을 구매 날짜별로 묶기 */
function groupByDate(orders) {
  return orders.reduce((groups, order) => {
    const date = new Date(order.ordered_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const last = groups[groups.length - 1];
    if (last && last.date === date) {
      last.orders.push(order);
    } else {
      groups.push({ date, orders: [order] });
    }
    return groups;
  }, []);
}

/**
 * OrdersPage 컴포넌트 - 구매 내역 (구매 날짜별 정리, 배송 현황, 리뷰 쓰기)
 *
 * Props: 없음
 *
 * Example usage:
 * <Route path="/mypage/orders" element={<OrdersPage />} />
 */
function OrdersPage() {
  const showPopup = usePopup();
  const handleError = useApiError();
  const { token, member } = useAuth();
  const [orders, setOrders] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = useCallback(() => {
    getOrders(token).then(setOrders).catch(handleError);
  }, [token, handleError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmitReview = async (rating, content) => {
    if (!content.trim()) {
      await showPopup({ message: '리뷰 내용을 입력해주세요.' });
      return;
    }
    try {
      await createReview(token, reviewTarget.order_item_id, rating, content);
      setReviewTarget(null);
      await showPopup({ message: '리뷰가 등록되었습니다.' });
      load();
    } catch (error) {
      handleError(error);
    }
  };

  if (!orders) {
    return <StatusMessage isLoading />;
  }

  return (
    <PageContainer maxWidth={ 800 } bgcolor="#F5F5F5">
      <PageTitle>구매 내역</PageTitle>
      { orders.length === 0 ? (
        <StatusMessage message="구매한 제품 없음" />
      ) : (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 5 } }>
          { groupByDate(orders).map((group) => (
            <Box key={ group.date }>
              <Box sx={ { fontSize: 18, fontWeight: 700, mb: 1.5 } }>{ group.date }</Box>
              <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1.5 } }>
                { group.orders.map((order) => (
                  <Box key={ order.order_id } sx={ { display: 'flex', flexDirection: 'column', gap: 1 } }>
                    <Box sx={ { fontSize: 13, color: '#666666' } }>{ `주문번호 ${order.order_number}` }</Box>
                    { order.items.map((item) => (
                      <OrderItemCard
                        key={ item.order_item_id }
                        item={ item }
                        deliveryStatus={ order.delivery_status }
                        onWriteReview={ () => setReviewTarget(item) }
                      />
                    )) }
                  </Box>
                )) }
              </Box>
            </Box>
          )) }
        </Box>
      ) }
      { reviewTarget && (
        <ReviewDialog
          isOpen
          mode="write"
          info={ {
            image_path: reviewTarget.image_path,
            writer_name: member?.name,
            product_name: reviewTarget.product_name,
            color: reviewTarget.color,
            size: reviewTarget.size,
          } }
          onClose={ () => setReviewTarget(null) }
          onSubmit={ handleSubmitReview }
        />
      ) }
    </PageContainer>
  );
}

export default OrdersPage;
