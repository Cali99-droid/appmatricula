import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export const handleDBExceptions = (error: any, logger: Logger) => {
  // const logger = new Logger('DBError');
  if (error.errno === 1062) {
    throw new BadRequestException(error.sqlMessage);
  }
  if (error.errno === 1451) {
    throw new BadRequestException(
      'Cannot delete or update, there is data associated with this record ',
    );
  }
  if (error.errno === 1452) {
    throw new BadRequestException('Invalid foreign key id');
  }
  logger.error(error);
  console.log(error);
  throw new InternalServerErrorException('Unexpected error, check server logs');
};
