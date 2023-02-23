import { SfdxCommand } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
export default class Org extends SfdxCommand {
    static description: string;
    static examples: string[];
    run(): Promise<AnyJson>;
}
