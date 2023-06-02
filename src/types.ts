export type CommandType = 'curl' | 'http';

type CustomMarkdownType = string;

export type MarkdownType =
  | 'code_with_result'
  | 'code'
  | 'list'
  | 'checkbox'
  | 'table'
  | CustomMarkdownType;

export type Project = {
  path: string;
  apiTarget: string;
  origin: string;
  commandType: CommandType;
  markdownType: MarkdownType;
  outputFilePath: string;
  outputFileName: string;
  pathParameters: Record<string, string>;
};

export type Projects = Record<string, Project>;

export type ResponseMessage = {
  _default: string;
  exceeded: string;
};

export type Config = {
  select: boolean;
  display: boolean;
  call: boolean;
  indent: number;
  numberOfItems: number;
  responseMessage: ResponseMessage;
};

export type FormInput = {
  formInput: {
    values: Record<string, string>;
    result: string;
  };
};
