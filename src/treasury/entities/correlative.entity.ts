import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['serie'])
export class Correlative {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  type: string; // Ejemplo: "BOLETA" o "FACTURA"

  @Column({ type: 'varchar', length: 10 })
  serie: string; // Ejemplo: "B001"

  @Column({ type: 'int' })
  numero: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
