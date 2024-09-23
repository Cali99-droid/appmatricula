import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { Status } from '../enum/status.enum';

@EventSubscriber()
export class EnrollmentSubscriber
  implements EntitySubscriberInterface<Enrollment>
{
  listenTo() {
    return Enrollment;
  }

  async beforeInsert(event: InsertEvent<Enrollment>) {
    if (event.entity.status) {
      await this.resetOtherStatuses(event);
    }
  }
  async beforeUpdate(event: UpdateEvent<Enrollment>) {
    const entity = event.entity;
    if (entity && entity.status) {
      await this.resetOtherStatuses(event);
    }
  }
  private async resetOtherStatuses(
    event: InsertEvent<Enrollment> | UpdateEvent<Enrollment>,
  ) {
    await event.manager
      .getRepository(Enrollment)
      .createQueryBuilder()
      .update(Enrollment)
      .set({ status: Status.PROMOVIDO })
      .where('id != :id', { id: event.entity.id || 0 })
      .execute();
  }
}
