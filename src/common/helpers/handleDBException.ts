import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

export const handleDBExceptions = (error: any, logger: Logger) => {
  // console.log(error);
  // const logger = new Logger('DBError');
  if (error.errno === 1062) {
    throw new BadRequestException(error.sqlMessage);
  }
  if (error.errno === 1452) {
    throw new BadRequestException('Invalid foreign key id');
  }
  logger.error(error);
  throw new InternalServerErrorException('Unexpected error, check server logs');
};
