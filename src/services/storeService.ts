import { StoreDetails, VerificationState, StoreDocument } from '../types';
import { mockStoreDetails, mockDocuments } from '../data/mockData';

class StoreService {
  private store: StoreDetails = { ...mockStoreDetails };
  private documents: StoreDocument[] = [...mockDocuments];
  private listeners: Array<() => void> = [];

  public getStoreDetails(): StoreDetails {
    return { ...this.store };
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

  public updateStoreDetails(updates: Partial<StoreDetails>): StoreDetails {
    this.store = { ...this.store, ...updates };
    this.notify();
    return { ...this.store };
  }

  public toggleStoreStatus(isOpen: boolean, closedReason?: string, reopenTime?: string): void {
    this.store = {
      ...this.store,
      isOpen,
      closedReason: isOpen ? undefined : closedReason,
      reopenTime: isOpen ? undefined : reopenTime,
    };
    this.notify();
  }

  public setVerificationState(status: VerificationState, reason?: string): void {
    this.store = {
      ...this.store,
      verificationStatus: status,
      rejectionReason: reason,
    };
    this.notify();
  }

  public getDocuments(): StoreDocument[] {
    return [...this.documents];
  }

  public updateDocument(docId: string, updates: Partial<StoreDocument>): void {
    this.documents = this.documents.map(doc => 
      doc.id === docId ? { ...doc, ...updates } : doc
    );
    this.notify();
  }
}

export const storeService = new StoreService();
