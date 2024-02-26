import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Year } from '../entities/year.entity';

@EventSubscriber()
export class YearSubscriber implements EntitySubscriberInterface<Year> {
  listenTo() {
    return Year;
  }

  async beforeInsert(event: InsertEvent<Year>) {
    if (event.entity.status) {
      await this.resetOtherStatuses(event);
    }
  }
  async beforeUpdate(event: UpdateEvent<Year>) {
    const entity = event.entity;
    if (entity && entity.status) {
      await this.resetOtherStatuses(event);
    }
  }
  private async resetOtherStatuses(
    event: InsertEvent<Year> | UpdateEvent<Year>,
  ) {
    await event.manager
      .getRepository(Year)
      .createQueryBuilder()
      .update(Year)
      .set({ status: false })
      .where('id != :id', { id: event.entity.id || 0 })
      .execute();
  }
}
