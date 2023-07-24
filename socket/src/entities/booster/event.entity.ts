import { BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

export class Event extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id : number;

}