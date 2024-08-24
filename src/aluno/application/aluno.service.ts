import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateAlunoCommand } from './commands/create-aluno-command';
import { AlunoRepository } from './ports/aluno.repository';
import { AlunoFactory } from '../domain/factories/aluno-factory';
import * as path from 'path';
import * as fs from 'fs';
import { Aluno } from '../domain/aluno';
import { Curso } from '../domain/curso.interface';

@Injectable()
export class AlunoService {
  constructor(
    private readonly alunoRepository: AlunoRepository,
    private readonly alunoFactory: AlunoFactory,
  ) {}

  private readonly filePath = path.resolve('src/aluno/data/alunos.json');
  private readAluno():  Aluno[] {
    const data = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(data) as  Aluno[];
  }

  private writeAluno(alunos: Aluno[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(alunos, null, 2), 'utf8');
  }


  cadastrar(createAlunoCommand: CreateAlunoCommand) {
    this.validarIdadeMinima(createAlunoCommand);
    this.validarSeJaExiste(createAlunoCommand);
    const  alunos = this.readAluno();

    const novoAluno = this.alunoFactory.criar(
      createAlunoCommand.nome,
      createAlunoCommand.endereco,
      createAlunoCommand.email,
      createAlunoCommand.telefone,
    );
    alunos.push(novoAluno);
    this.writeAluno(alunos);
    return novoAluno;
  }

  matricular(idAluno: string, idCurso: string, cargaHoraria: number) {
  
    const alunos = this.readAluno();
    const newMatricula: Curso = {
      id: idCurso,
      nome: 'Curso de teste',
      cargaHoraria: cargaHoraria,
    }

    if (alunos) {
      const aluno = alunos.find(a => a.id === idAluno);
      if (aluno && !aluno.cursos.includes(newMatricula)) {
          aluno.cursos.push(newMatricula);
          this.writeAluno(alunos);
      }
  }
  }

  private validarSeJaExiste(createAlunoCommand: CreateAlunoCommand) {
    const alunoExistente = this.alunoRepository.buscarPorEmail(
      createAlunoCommand.email,
    );
    if (alunoExistente) {
      throw new ConflictException(
        'Já existe um aluno cadastrado com esse email.',
      );
    }
  }

  private validarIdadeMinima(createAlunoCommand: CreateAlunoCommand) {
    const anoAtual = new Date().getFullYear();
    const idade = anoAtual - createAlunoCommand.anoNascimento;
    const IDADE_MIN_CADASTRO = 16;
    if (idade <= IDADE_MIN_CADASTRO) {
      throw new ForbiddenException('A idade mínima para cadastro é 16 anos.');
    }
  }

  listar() {
    return this.alunoRepository.listar();
  }
}
