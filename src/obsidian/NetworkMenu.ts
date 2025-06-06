import { BehaviorSubject } from 'rxjs';

export enum NetworkStatus {
  UNKOWN = 1,
  HEALTH,
  CONNECTION_ERROR,
};

export enum SyncStatus {
  UNKOWN = 1,
  UPLOAD, // when patch, insert
  DOWNLOAD, // when list
  SUCCESS_WAITING,
  FAILED_WARNING,
}

export const gfSyncStatus$ = new BehaviorSubject<SyncStatus>(SyncStatus.UNKOWN);
export const gfNetStatus$ = new BehaviorSubject<NetworkStatus>(NetworkStatus.UNKOWN);

  export function updateNetStatusItem(newNetStatus: NetworkStatus) {
    switch (newNetStatus) {
      case NetworkStatus.HEALTH:
        this.netStatusItem.setText("Net: 🟢");
        break;
      case NetworkStatus.CONNECTION_ERROR:
        this.netStatusItem.setText("Net: 🔴");
        break;
      case NetworkStatus.UNKOWN:
      default:
        this.netStatusItem.setText("Net: ⚫️");
        break;
    }
  }

  export function updateSyncStatusItem(newSyncStatus: SyncStatus) {
    switch (newSyncStatus) {
      case SyncStatus.UPLOAD:
        this.syncStatusItem.setText("Sync: 🔼");
        break;
      case SyncStatus.DOWNLOAD:
        this.syncStatusItem.setText("Sync: 🔽");
        break;
      case SyncStatus.FAILED_WARNING:
        this.syncStatusItem.setText("Sync: 🆖");
        break;
      case SyncStatus.SUCCESS_WAITING:
        this.syncStatusItem.setText("Sync: 🆗");
        break;
      case SyncStatus.UNKOWN:
      default:
        this.syncStatusItem.setText("Sync: *️⃣");
        break;
    }
  }