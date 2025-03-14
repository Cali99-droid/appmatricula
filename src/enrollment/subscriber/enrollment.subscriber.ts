// import {
//   EntitySubscriberInterface,
//   EventSubscriber,
//   InsertEvent,
//   UpdateEvent,
// } from 'typeorm';

// import { Enrollment } from '../entities/enrollment.entity';

// @EventSubscriber()
// export class EnrollmentSubscriber
//   implements EntitySubscriberInterface<Enrollment>
// {
//   listenTo() {
//     return Enrollment;
//   }

//   async beforeInsert(event: InsertEvent<Enrollment>) {
//     if (event.entity.isActive) {
//       await this.resetOtherStatuses(event);
//     }
//   }
//   async beforeUpdate(event: UpdateEvent<Enrollment>) {
//     const entity = event.entity;
//     if (entity && entity.isActive) {
//       await this.resetOtherStatuses(event);
//     }
//   }
//   private async resetOtherStatuses(
//     event: InsertEvent<Enrollment> | UpdateEvent<Enrollment>,
//   ) {
//     const enrollment = await event.manager.getRepository(Enrollment).findOne({
//       where: { id: event.entity.id },
//       relations: ['student'], // Cargar la relación student
//     });

//     if (!enrollment || !enrollment.student) {
//       throw new Error('Student relation is not loaded or enrollment not found');
//     }

//     await event.manager
//       .getRepository(Enrollment)
//       .createQueryBuilder()
//       .update(Enrollment)
//       .set({ isActive: false })
//       .where('id != :id', { id: enrollment.id })
//       .andWhere('studentId = :studentId', {
//         studentId: enrollment.student.id,
//       })
//       .execute();
//   }
// }
