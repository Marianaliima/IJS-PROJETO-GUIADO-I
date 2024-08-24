import {
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
  } from 'class-validator';
  
  export class CreateCursoDto {
    @IsString()
    id: string;

    @IsString()
    nome: string;
  
  
    @IsNotEmpty()
    @IsPositive()
    @IsNumber()
    cargaHoraria: number;
  }
  