import { MultipartFile } from '@fastify/multipart';
import { HttpService } from '@nestjs/axios';
import {
  HttpException, Inject, Injectable,
  Logger,
} from '@nestjs/common';
import FormData from 'form-data';
import { catchError, map, Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { FastifyReply } from 'fastify';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class FileService {

  private readonly logger: Logger;
  private readonly configService: ConfigService;
  private readonly httpService: HttpService;

  public constructor(
    configService: ConfigService,
    httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) logger: Logger,
  ) {
    this.logger = logger;
    this.configService = configService;
    this.httpService = httpService;
  }

  public stream(urlFromController: string, response: FastifyReply): Observable<void> {
    const filerUrl = this.configService.get('filerUrl');
    const filerPath = urlFromController.substring('/file/'.length);
    const fileUrl = new URL(filerPath, filerUrl).href;
    return this.httpService
      .get(fileUrl, { responseType: 'stream' })
      .pipe(map((stream) => {
        response.headers(stream.headers);
        response.header('server', 'Codern File System 1.0');
        return stream.data;
      }))
      .pipe(catchError((error) => {
        if (error.response) {
          const message = `${error.response.statusText} /${filerPath}`;
          throw new HttpException(message, error.response.status);
        } else {
          this.logger.error(error, error, 'FileStreamingError');
          throw new HttpException('Something went wrong on streaming from file system', 500);
        }
      }));
  }

  public async upload(multipartFile: MultipartFile, path: string): Promise<void> {
    const upstream = multipartFile.file;
    const formData = new FormData();
    formData.append('file', upstream);

    const filerUrl = this.configService.get('filerUrl');
    const fileUrl = new URL(path, filerUrl).href;
    await this.httpService.axiosRef.request({
      url: fileUrl,
      method: 'POST',
      headers: formData.getHeaders(),
      data: formData,
    });
  }

}
