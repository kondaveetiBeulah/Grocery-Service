import { Order, OrderStatus, OrderItem, ProductItem } from '../types';
import { mockOrders } from '../data/mockData';

class OrderService {
  private orders: Order[] = [...mockOrders];
  private listeners: Array<() => void> = [];

  public getOrders(statusFilter?: OrderStatus): Order[] {
    if (!statusFilter) return [...this.orders];
    return this.orders.filter(order => order.status === statusFilter);
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.orders.find(o => o.id === orderId);
  }

  public searchOrders(query: string): Order[] {
    const q = query.trim().toLowerCase();
    if (!q) return [...this.orders];
    return this.orders.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.shortId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  public acceptOrder(orderId: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.status = 'PICKING';
    order.timeline.push({
      title: 'Store Accepted & Picking Started',
      time: 'Just now',
      completed: true,
    });
    this.notify();
    return true;
  }

  public rejectOrder(orderId: string, reason: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.status = 'CANCELLED';
    order.cancelReason = reason;
    order.timeline.push({
      title: `Rejected: ${reason}`,
      time: 'Just now',
      completed: true,
    });
    this.notify();
    return true;
  }

  public toggleItemPicked(orderId: string, itemId: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    const item = order.items.find(i => i.id === itemId);
    if (!item) return false;
    item.isPicked = !item.isPicked;
    this.notify();
    return true;
  }

  public updateItemWeight(orderId: string, itemId: string, actualWeight: number): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    const item = order.items.find(i => i.id === itemId);
    if (!item) return false;
    item.actualWeight = actualWeight;
    item.isPicked = true;
    this.notify();
    return true;
  }

  public setItemUnavailable(
    orderId: string, 
    itemId: string, 
    action: 'replace' | 'refund', 
    replacement?: ProductItem
  ): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    const item = order.items.find(i => i.id === itemId);
    if (!item) return false;
    
    item.isUnavailable = true;
    item.isPicked = false;
    item.substitution = {
      status: action === 'replace' ? 'Approved' : 'Approved',
      action,
      replacementProduct: replacement,
      originalPrice: item.unitPrice * item.quantity,
      newPrice: replacement ? replacement.sellingPrice * item.quantity : 0,
    };

    // Update order total if refunded
    if (action === 'refund') {
      const refundAmount = item.unitPrice * item.quantity;
      order.discount += refundAmount;
      order.totalAmount = Math.max(0, order.totalAmount - refundAmount);
    } else if (replacement) {
      const priceDiff = (replacement.sellingPrice - item.unitPrice) * item.quantity;
      order.totalAmount += priceDiff;
    }

    this.notify();
    return true;
  }

  public updateBagCount(orderId: string, bagCount: number): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.bagCount = Math.max(1, bagCount);
    this.notify();
    return true;
  }

  public updateQualityChecks(
    orderId: string, 
    checks: { coldItemsSeparated: boolean; liquidsSealed: boolean; fragileOnTop: boolean }
  ): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.bagQualityChecks = { ...checks };
    this.notify();
    return true;
  }

  public completePacking(orderId: string): boolean {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return false;
    order.status = 'READY_FOR_PICKUP';
    order.packingTimeRemainingSeconds = 0;
    order.timeline.push({
      title: `Packed & Bagged (${order.bagCount} Bag${order.bagCount > 1 ? 's' : ''})`,
      time: 'Just now',
      completed: true,
    });
    this.notify();
    return true;
  }

  public verifyHandover(orderId: string, code: string): { success: boolean; message: string } {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };
    if (!order.rider) return { success: false, message: 'No rider assigned to this order' };
    if (order.rider.pickupCode !== code.trim()) {
      return { success: false, message: 'Invalid 4-digit pickup code. Please check with rider.' };
    }
    
    order.status = 'COMPLETED';
    order.timeline.push({
      title: 'Handed Over to Rider & Code Verified',
      time: 'Just now',
      completed: true,
    });
    this.notify();
    return { success: true, message: 'Order successfully handed over!' };
  }
}

export const orderService = new OrderService();
