import { ICodeActionProvider } from "./ICodeActionProvider";
import { SyntaxTree } from "../AL Code Outline/syntaxTree";
import { ALSourceCodeHandler } from "../Utils/alSourceCodeHandler";
import { CreateProcedureAL0118 } from '../Create Procedure/Procedure Creator/CreateProcedureAL0118';
import { CreateProcedure } from '../Create Procedure/Procedure Creator/CreateProcedure';
import { ALProcedure } from '../Entities/alProcedure';
import { CreateProcedureAL0118IntegrationEvent } from '../Create Procedure/Procedure Creator/CreateProcedureAL0118IntegrationEvent';
import { CreateProcedureAL0118BusinessEvent } from '../Create Procedure/Procedure Creator/CreateProcedureAL0118BusinessEvent';
import { WorkspaceUtils } from '../Utils/workspaceUtils';
import { TextDocument, Diagnostic, CodeAction, CodeActionKind, Location } from "vscode";
import { Command } from "../Entities/Command";
import { CodeActionProviderAL0132 } from "./CodeActionProviderAL0132";

export class CodeActionProviderAL0118 implements ICodeActionProvider {
    syntaxTree: SyntaxTree | undefined;
    document: TextDocument;
    diagnostic: Diagnostic;
    constructor(document: TextDocument, diagnostic: Diagnostic) {
        this.document = document;
        this.diagnostic = diagnostic;
    }
    async considerLine(): Promise<boolean> {
        this.syntaxTree = await SyntaxTree.getInstance(this.document);
        if (await new ALSourceCodeHandler(this.document).isInvocationExpression(this.diagnostic.range)) {
            return true;
        }
        return false;
    }

    async createCodeActions(): Promise<CodeAction[]> {
        let codeActions: CodeAction[] = [];
        let createprocedureAL0118: CreateProcedureAL0118 = new CreateProcedureAL0118(this.document, this.diagnostic);
        let procedure: ALProcedure = await CreateProcedure.createProcedure(createprocedureAL0118);
        let sourceLocation = new Location(this.document.uri, this.diagnostic.range);
        let codeActionProcedure: CodeAction = await this.createCodeAction(procedure, 'Create procedure ' + procedure.name, this.document, sourceLocation);

        if (procedure.ObjectOfProcedure.type.toLowerCase() == 'page') {
            let codeActionSourceTable: CodeAction | undefined = await new CodeActionProviderAL0132(this.document, this.diagnostic).createCodeActionSourceRec(procedure)
            if (codeActionSourceTable)
                codeActions.push(codeActionSourceTable);
        }

        let prefixes: string[] | undefined = await WorkspaceUtils.findValidAppSourcePrefixes(this.document.uri);
        let regexPattern: RegExp = prefixes ? new RegExp("^(" + prefixes.join('|') + "|" + prefixes.join('_|') + "_)?On[A-Za-z].*$") : new RegExp("^On[A-Za-z].*$");

        if (procedure.name.match(regexPattern)) {

            let createProcedureAL0118IntegrationEvent: CreateProcedureAL0118IntegrationEvent = new CreateProcedureAL0118IntegrationEvent(this.document, this.diagnostic);
            let integrationEvent: ALProcedure = await CreateProcedure.createProcedure(createProcedureAL0118IntegrationEvent);
            let codeActionIntegrationEvent: CodeAction = await this.createCodeAction(integrationEvent, 'Create IntegrationEvent Publisher ' + integrationEvent.name, this.document, sourceLocation);
            codeActionIntegrationEvent.isPreferred = true;
            codeActions.push(codeActionIntegrationEvent);

            let createProcedureAL0118BusinessEvent: CreateProcedureAL0118BusinessEvent = new CreateProcedureAL0118BusinessEvent(this.document, this.diagnostic);
            let businessEvent: ALProcedure = await CreateProcedure.createProcedure(createProcedureAL0118BusinessEvent);
            let codeActionBusinessEvent: CodeAction = await this.createCodeAction(businessEvent, 'Create BusinessEvent Publisher ' + businessEvent.name, this.document, sourceLocation);
            codeActions.push(codeActionBusinessEvent);
        } else
            codeActionProcedure.isPreferred = true;

        codeActions.push(codeActionProcedure);
        return codeActions;
    }

    private async createCodeAction(procedure: ALProcedure, msg: string, document: TextDocument, sourceLocation: Location): Promise<CodeAction> {
        const codeAction = new CodeAction(msg, CodeActionKind.QuickFix);
        codeAction.command = {
            command: Command.createProcedureCommand,
            title: 'Create Procedure',
            arguments: [document, procedure, sourceLocation]
        };
        return codeAction;
    }
}