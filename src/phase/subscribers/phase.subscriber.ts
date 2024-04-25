import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Phase } from '../entities/phase.entity';

@EventSubscriber()
export class PhaseSubscriber implements EntitySubscriberInterface<Phase> {
  listenTo() {
    return Phase;
  }

  async beforeInsert(event: InsertEvent<Phase>) {
    if (event.entity.status) {
      await this.resetOtherStatuses(event);
    }
  }
  async beforeUpdate(event: UpdateEvent<Phase>) {
    const entity = event.entity;
    if (entity && entity.status) {
      await this.resetOtherStatuses(event);
    }
  }
  private async resetOtherStatuses(
    event: InsertEvent<Phase> | UpdateEvent<Phase>,
  ) {
    await event.manager
      .getRepository(Phase)
      .createQueryBuilder()
      .update(Phase)
      .set({ status: false })
      .where('id != :id', { id: event.entity.id || 0 })
      .execute();
  }
}
