import { SfdxCommand, flags } from '@salesforce/command';
import { AnyJson } from '@salesforce/ts-types';
export default class Reactforce extends SfdxCommand {
    static description: string;
    static examples: string[];
    static flagsConfig: {
        version: flags.Discriminated<flags.Boolean<boolean>>;
    };
    run(): Promise<AnyJson>;
}
