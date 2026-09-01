import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { FindOptionsWhere, Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { BaseSeed } from '../../../common';
import { ERole, RoleEntity } from '../entities';


const VERSION = 2;

@Injectable()
export class RolesSeed extends BaseSeed<RoleEntity> {
  public get version(): number {
    return VERSION;
  }

  public get seedingData(): Partial<RoleEntity>[] {
    return [
      { name: ERole.SuperAdmin,   description: 'Full platform access across all organizations' },
      { name: ERole.OrgAdmin,     description: 'Full access within an organization' },
      { name: ERole.OrgManager,   description: 'Equal authority to Org Admin for approvals, black sales, and black inventory' },
      { name: ERole.StoreManager, description: 'Manage a specific store and its inventory' },
      { name: ERole.StoreStaff,   description: 'Day-to-day stock operations within a store' },
      { name: ERole.Picker,       description: 'Warehouse picker — claims and packs orders for dispatch' },
      { name: ERole.Driver,       description: 'Delivery driver — manages trips and confirms deliveries' },
    ];
  }

  constructor(
    dataSource: DataSource,
    @InjectRepository(RoleEntity) repo: Repository<RoleEntity>,
    @InjectPinoLogger(RolesSeed.name) logger: PinoLogger,
  ) {
    super(dataSource, repo, logger);
  }

  protected equalityCheck(x: Partial<RoleEntity>, y: Partial<RoleEntity>): boolean {
    return x.name === y.name;
  }

  protected createFilter(): FindOptionsWhere<RoleEntity> {
    return {};
  }
}
