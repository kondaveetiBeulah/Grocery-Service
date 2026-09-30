import { EarningsSummary, EarningsPeriod, PayoutTransaction, StoreInsightsData, CustomerReview } from '../types';
import { mockEarningsSummary, mockPayoutHistory, mockStoreInsights, mockCustomerReviews } from '../data/mockData';

class EarningsService {
  private summary: EarningsSummary = { ...mockEarningsSummary };
  private payouts: PayoutTransaction[] = [...mockPayoutHistory];
  private insights: StoreInsightsData = { ...mockStoreInsights };
  private reviews: CustomerReview[] = [...mockCustomerReviews];
  private listeners: Array<() => void> = [];

  public getEarningsSummary(period: EarningsPeriod = 'Today'): EarningsSummary {
    // Return modified simulated metrics depending on time period
    let multiplier = 1;
    if (period === 'This Week') multiplier = 6.5;
    if (period === 'This Month') multiplier = 26.0;
    if (period === 'Custom Date') multiplier = 3.2;

    return {
      ...this.summary,
      period,
      grossSales: Math.round(this.summary.grossSales * multiplier),
      totalRefunds: Math.round(this.summary.totalRefunds * multiplier),
      platformCommission: Math.round(this.summary.platformCommission * multiplier),
      netEarnings: Math.round(this.summary.netEarnings * multiplier),
      orderCount: Math.round(this.summary.orderCount * multiplier),
    };
  }

  public getPayouts(): PayoutTransaction[] {
    return [...this.payouts];
  }

  public getInsights(): StoreInsightsData {
    return { ...this.insights };
  }

  public getReviews(filterRating?: number): CustomerReview[] {
    if (filterRating) {
      return this.reviews.filter(r => r.rating === filterRating);
    }
    return [...this.reviews];
  }

  public reportReview(reviewId: string): boolean {
    const rev = this.reviews.find(r => r.id === reviewId);
    if (!rev) return false;
    rev.isReported = true;
    this.notify();
    return true;
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
}

export const earningsService = new EarningsService();
