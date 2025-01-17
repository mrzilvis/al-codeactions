import * as assert from 'assert';
import * as path from 'path';
import { CodeAction, Location, Range, TextDocument, TextEdit, Uri, window, workspace, WorkspaceEdit } from 'vscode';
import { ALVariable } from '../../extension/Entities/alVariable';
import { Command } from '../../extension/Entities/Command';
import { CodeActionProviderModifyProcedureContent, PublisherToAdd } from '../../extension/Services/CodeActionProviderModifyProcedureContent';
import { ALLanguageExtension } from '../alExtension';
import { VSCodeFunctions, vscodeMock } from '../vscodeMock';
import { ALTestProject } from './ALTestProject';
import { TestHelper } from './TestHelper';

// import * as myExtension from '../extension';

suite('ALModifyProcedureContent Test Suite', function () {
	let addPublishersToProcedure: TextDocument;
	this.timeout(0);
	this.beforeAll('beforeTests', async function () {
		this.timeout(0);
		await ALLanguageExtension.getInstance().activate();

		//open the file just once
		let modifyProcDir = path.resolve(ALTestProject.dir, 'ModifyProcedure')
		addPublishersToProcedure = await workspace.openTextDocument(path.resolve(modifyProcDir, 'AddPublishersToProcedure.Codeunit.al'));

		window.showInformationMessage('Start all tests of ALModifyProcedureCA.');
	});

	test('NoParametersNoVarSectionNoReturn', async () => {
		let lineTextToSearch = 'procedure NoParametersNoVarSectionNoReturn()';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');
		let addParamCA = codeActions.find(entry => entry.command?.command == Command.modifyProcedureContent)

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push({
			function: VSCodeFunctions.QuickPick,
			values: [
				{
					items: [
						{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeNoParametersNoVarSectionNoReturn', true), parameterPositionPrio: 10 }
					],
					result: [
						{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeNoParametersNoVarSectionNoReturn', true), parameterPositionPrio: 10 }
					]
				}
			]
		})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 3);
		assert.strictEqual(textEdits.shift()!.newText, '    var\r\n        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeNoParametersNoVarSectionNoReturn(IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeNoParametersNoVarSectionNoReturn(var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, '    OnAfterNoParametersNoVarSectionNoReturn();\r\n    ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterNoParametersNoVarSectionNoReturn()\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})//.timeout(3000); //First time opening something can take a little bit longer

	test('ParametersNoVarSectionNoReturn', async () => {
		let lineTextToSearch = 'procedure ParametersNoVarSectionNoReturn(CustomerNo: Code[20])';
		let doc = addPublishersToProcedure
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push({
			function: VSCodeFunctions.QuickPick,
			values: [
				{
					items: [
						{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersNoVarSectionNoReturn', true), parameterPositionPrio: 10 },
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersNoVarSectionNoReturn', false), parameterPositionPrio: 8 }
					],
					result: [
						{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersNoVarSectionNoReturn', true), parameterPositionPrio: 10 },
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersNoVarSectionNoReturn', false), parameterPositionPrio: 8 }
					]
				},
				{
					items: [
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersNoVarSectionNoReturn', false), parameterPositionPrio: 8 }
					],
					result: [
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersNoVarSectionNoReturn', false), parameterPositionPrio: 8 }
					]
				}
			]
		})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 3);
		assert.strictEqual(textEdits.shift()!.newText, '    var\r\n        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersNoVarSectionNoReturn(CustomerNo, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersNoVarSectionNoReturn(CustomerNo: Code[20]; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, '    OnAfterParametersNoVarSectionNoReturn(CustomerNo);\r\n    ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersNoVarSectionNoReturn(CustomerNo: Code[20])\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionNoReturn1', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionNoReturn(CustomerNo: Code[20])';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push({
			function: VSCodeFunctions.QuickPick,
			values: [
				{
					items: [
						{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionNoReturn', true), parameterPositionPrio: 10 },
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNoReturn', false), parameterPositionPrio: 8 },
						{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnBeforeParametersVarSectionNoReturn', false), parameterPositionPrio: 7 }
					],
					result: [
						{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionNoReturn', true), parameterPositionPrio: 10 },
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNoReturn', false), parameterPositionPrio: 8 }
					]
				},
				{
					items: [
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionNoReturn', false), parameterPositionPrio: 8 },
						{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionNoReturn', false), parameterPositionPrio: 7 }
					],
					result: [
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionNoReturn', false), parameterPositionPrio: 8 }
					]
				}
			]
		})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 3);
		assert.strictEqual(textEdits.shift()!.newText, '        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionNoReturn(CustomerNo, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionNoReturn(CustomerNo: Code[20]; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, '    OnAfterParametersVarSectionNoReturn(CustomerNo);\r\n    ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionNoReturn(CustomerNo: Code[20])\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionNoReturn2', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionNoReturn(CustomerNo: Code[20])';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push({
			function: VSCodeFunctions.QuickPick,
			values: [
				{
					items: [
						{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionNoReturn', true), parameterPositionPrio: 10 },
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNoReturn', false), parameterPositionPrio: 8 },
						{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnBeforeParametersVarSectionNoReturn', false), parameterPositionPrio: 7 }
					],
					result: [
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNoReturn', false), parameterPositionPrio: 8 },
						{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnBeforeParametersVarSectionNoReturn', false), parameterPositionPrio: 7 }
					]
				},
				{
					items: [
						{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionNoReturn', false), parameterPositionPrio: 8 },
						{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionNoReturn', false), parameterPositionPrio: 7 }
					],
					result: [
						{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionNoReturn', false), parameterPositionPrio: 7 }
					]
				}
			]
		})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionNoReturn(Customer2, CustomerNo);\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionNoReturn(Customer2: Record Customer; CustomerNo: Code[20])\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, '    OnAfterParametersVarSectionNoReturn(Customer2);\r\n    ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionNoReturn(Customer2: Record Customer)\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionUnnamedReturn', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionUnnamedReturn(CustomerNo: Code[20]): Record Customer';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push(
			{
				function: VSCodeFunctions.QuickInput,
				values: [
					{
						options: { placeHolder: 'returnVar', prompt: 'Please specify a name for the return variable.' },
						result: 'Customer3'
					}
				]
			},
			{
				function: VSCodeFunctions.QuickPick,
				values: [
					{
						items: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturn', true), parameterPositionPrio: 10 },
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnBeforeParametersVarSectionUnnamedReturn', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturn', false), parameterPositionPrio: 8 },
							{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnBeforeParametersVarSectionUnnamedReturn', false), parameterPositionPrio: 7 },
						],
						result: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturn', true), parameterPositionPrio: 10 },
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnBeforeParametersVarSectionUnnamedReturn', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturn', false), parameterPositionPrio: 8 }
						]
					},
					{
						items: [
							{ label: "Customer2", picked: true, description: "Record Customer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionUnnamedReturn', true), parameterPositionPrio: 10 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturn', false), parameterPositionPrio: 8 }
						],
						result: [
							{ label: "Customer2", picked: true, description: "Record Customer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionUnnamedReturn', true), parameterPositionPrio: 10 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturn', false), parameterPositionPrio: 8 }
						]
					}
				]
			})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 4);
		assert.strictEqual(textEdits.shift()!.newText, ' Customer3')
		assert.strictEqual(textEdits.shift()!.newText, '        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionUnnamedReturn(CustomerNo, Customer3, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionUnnamedReturn(CustomerNo: Code[20]; var Customer3: Record Customer; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, 'OnAfterParametersVarSectionUnnamedReturn(CustomerNo, Customer2);\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionUnnamedReturn(CustomerNo: Code[20]; var Customer2: Record Customer)\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionNamedReturn', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionNamedReturn(CustomerNo: Code[20]) Customer3: Record Customer';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push(
			{
				function: VSCodeFunctions.QuickPick,
				values: [
					{
						items: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionNamedReturn', true), parameterPositionPrio: 10 },
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnBeforeParametersVarSectionNamedReturn', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNamedReturn', false), parameterPositionPrio: 8 },
							{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnBeforeParametersVarSectionNamedReturn', false), parameterPositionPrio: 7 },
						],
						result: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionNamedReturn', true), parameterPositionPrio: 10 },
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnBeforeParametersVarSectionNamedReturn', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNamedReturn', false), parameterPositionPrio: 8 }
						]
					},
					{
						items: [
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnAfterParametersVarSectionNamedReturn', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionNamedReturn', false), parameterPositionPrio: 8 },
							{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionNamedReturn', false), parameterPositionPrio: 7 }
						],
						result: [
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnAfterParametersVarSectionNamedReturn', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionNamedReturn', false), parameterPositionPrio: 8 }
						]
					}
				]
			})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 3);
		assert.strictEqual(textEdits.shift()!.newText, '        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionNamedReturn(CustomerNo, Customer3, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionNamedReturn(CustomerNo: Code[20]; var Customer3: Record Customer; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, '    OnAfterParametersVarSectionNamedReturn(CustomerNo, Customer3);\r\n    ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionNamedReturn(CustomerNo: Code[20]; var Customer3: Record Customer)\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionNamedReturnDifferentExit', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionNamedReturnDifferentExit(CustomerNo: Code[20]) Customer3: Record Customer';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push(
			{
				function: VSCodeFunctions.QuickPick,
				values: [
					{
						items: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionNamedReturnDifferentExit', true), parameterPositionPrio: 10 },
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnBeforeParametersVarSectionNamedReturnDifferentExit', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNamedReturnDifferentExit', false), parameterPositionPrio: 8 },
							{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnBeforeParametersVarSectionNamedReturnDifferentExit', false), parameterPositionPrio: 7 },
						],
						result: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionNamedReturnDifferentExit', true), parameterPositionPrio: 10 },
							{ label: "Customer3", picked: true, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnBeforeParametersVarSectionNamedReturnDifferentExit', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionNamedReturnDifferentExit', false), parameterPositionPrio: 8 }
						]
					},
					{
						items: [
							{ label: "Customer2", picked: true, description: "Record Customer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionNamedReturnDifferentExit', true), parameterPositionPrio: 10 },
							{ label: "Customer3", picked: false, description: "Record Customer, var: true, reason: return variable", variable: new ALVariable('Customer3', 'Record Customer', 'OnAfterParametersVarSectionNamedReturnDifferentExit', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionNamedReturnDifferentExit', false), parameterPositionPrio: 8 }
						],
						result: [
							{ label: "Customer2", picked: true, description: "Record Customer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionNamedReturnDifferentExit', true), parameterPositionPrio: 10 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionNamedReturnDifferentExit', false), parameterPositionPrio: 8 }
						]
					}
				]
			})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 3);
		assert.strictEqual(textEdits.shift()!.newText, '        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionNamedReturnDifferentExit(CustomerNo, Customer3, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionNamedReturnDifferentExit(CustomerNo: Code[20]; var Customer3: Record Customer; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, 'OnAfterParametersVarSectionNamedReturnDifferentExit(CustomerNo, Customer2);\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionNamedReturnDifferentExit(CustomerNo: Code[20]; var Customer2: Record Customer)\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionUnnamedReturnMemberAccess', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionUnnamedReturnMemberAccess(CustomerNo: Code[20]): Decimal';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push(
			{
				function: VSCodeFunctions.QuickInput,
				values: [
					{
						options: { placeHolder: 'returnVar', prompt: 'Please specify a name for the return variable.' },
						result: 'Amount'
					}
				]
			},
			{
				function: VSCodeFunctions.QuickPick,
				values: [
					{
						items: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess', true), parameterPositionPrio: 10 },
							{ label: "Amount", picked: true, description: "Decimal, var: true, reason: return variable", variable: new ALVariable('Amount', 'Decimal', 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess', false), parameterPositionPrio: 8 },
							{ label: "Customer2", picked: false, description: "Record Customer, var: false, reason: local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess', false), parameterPositionPrio: 7 },
						],
						result: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess', true), parameterPositionPrio: 10 },
							{ label: "Amount", picked: true, description: "Decimal, var: true, reason: return variable", variable: new ALVariable('Amount', 'Decimal', 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess', false), parameterPositionPrio: 8 }
						]
					},
					{
						items: [
							{ label: "Customer2", picked: true, description: "Record Customer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionUnnamedReturnMemberAccess', true), parameterPositionPrio: 10 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturnMemberAccess', false), parameterPositionPrio: 8 }
						],
						result: [
							{ label: "Customer2", picked: true, description: "Record Customer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('Customer2', 'Record Customer', 'OnAfterParametersVarSectionUnnamedReturnMemberAccess', true), parameterPositionPrio: 10 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturnMemberAccess', false), parameterPositionPrio: 8 }
						]
					}
				]
			})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 4);
		assert.strictEqual(textEdits.shift()!.newText, ' Amount')
		assert.strictEqual(textEdits.shift()!.newText, '        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionUnnamedReturnMemberAccess(CustomerNo, Amount, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionUnnamedReturnMemberAccess(CustomerNo: Code[20]; var Amount: Decimal; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, 'OnAfterParametersVarSectionUnnamedReturnMemberAccess(CustomerNo, Customer2);\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionUnnamedReturnMemberAccess(CustomerNo: Code[20]; var Customer2: Record Customer)\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionUnnamedReturnSimpleType', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionUnnamedReturnSimpleType(CustomerNo: Code[20]): Integer';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push(
			{
				function: VSCodeFunctions.QuickInput,
				values: [
					{
						options: { placeHolder: 'returnVar', prompt: 'Please specify a name for the return variable.' },
						result: 'rInt'
					}
				]
			},
			{
				function: VSCodeFunctions.QuickPick,
				values: [
					{
						items: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturnSimpleType', true), parameterPositionPrio: 10 },
							{ label: "rInt", picked: true, description: "Integer, var: true, reason: return variable", variable: new ALVariable('rInt', 'Integer', 'OnBeforeParametersVarSectionUnnamedReturnSimpleType', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturnSimpleType', false), parameterPositionPrio: 8 },
							{ label: "myInt", picked: false, description: "Integer, var: false, reason: local variable", variable: new ALVariable('myInt', 'Integer', 'OnBeforeParametersVarSectionUnnamedReturnSimpleType', false), parameterPositionPrio: 7 },
						],
						result: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturnSimpleType', true), parameterPositionPrio: 10 },
							{ label: "rInt", picked: true, description: "Integer, var: true, reason: return variable", variable: new ALVariable('rInt', 'Integer', 'OnBeforeParametersVarSectionUnnamedReturnSimpleType', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturnSimpleType', false), parameterPositionPrio: 8 }
						]
					},
					{
						items: [
							{ label: "myInt", picked: true, description: "Integer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('myInt', 'Integer', 'OnAfterParametersVarSectionUnnamedReturnSimpleType', true), parameterPositionPrio: 10 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturnSimpleType', false), parameterPositionPrio: 8 }
						],
						result: [
							{ label: "myInt", picked: true, description: "Integer, var: true, reason: used in exit statement + local variable", variable: new ALVariable('myInt', 'Integer', 'OnAfterParametersVarSectionUnnamedReturnSimpleType', true), parameterPositionPrio: 10 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturnSimpleType', false), parameterPositionPrio: 8 }
						]
					}
				]
			})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 4);
		assert.strictEqual(textEdits.shift()!.newText, ' rInt')
		assert.strictEqual(textEdits.shift()!.newText, '        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionUnnamedReturnSimpleType(CustomerNo, rInt, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionUnnamedReturnSimpleType(CustomerNo: Code[20]; var rInt: Integer; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, 'OnAfterParametersVarSectionUnnamedReturnSimpleType(CustomerNo, myInt);\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionUnnamedReturnSimpleType(CustomerNo: Code[20]; var myInt: Integer)\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})

	test('ParametersVarSectionUnnamedReturnConstant', async () => {
		let lineTextToSearch = 'procedure ParametersVarSectionUnnamedReturnConstant(CustomerNo: Code[20]): Integer';
		let doc = addPublishersToProcedure;
		let procedureStartPos = TestHelper.getRangeOfLine(doc, lineTextToSearch).start.translate(undefined, + 'procedure '.length)
		let codeActionProvider = new CodeActionProviderModifyProcedureContent(doc, new Range(procedureStartPos, procedureStartPos))
		let consider: boolean = await codeActionProvider.considerLine();
		assert.strictEqual(consider, true, 'Code action should be considered');
		let codeActions: CodeAction[] = await codeActionProvider.createCodeActions();
		assert.strictEqual(codeActions.length, 2, 'Code action should be created');

		let mock: vscodeMock = new vscodeMock();
		mock.expected.push(
			{
				function: VSCodeFunctions.QuickInput,
				values: [
					{
						options: { placeHolder: 'returnVar', prompt: 'Please specify a name for the return variable.' },
						result: 'rInt'
					}
				]
			},
			{
				function: VSCodeFunctions.QuickPick,
				values: [
					{
						items: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturnConstant', true), parameterPositionPrio: 10 },
							{ label: "rInt", picked: true, description: "Integer, var: true, reason: return variable", variable: new ALVariable('rInt', 'Integer', 'OnBeforeParametersVarSectionUnnamedReturnConstant', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturnConstant', false), parameterPositionPrio: 8 },
							{ label: "myInt", picked: false, description: "Integer, var: false, reason: local variable", variable: new ALVariable('myInt', 'Integer', 'OnBeforeParametersVarSectionUnnamedReturnConstant', false), parameterPositionPrio: 7 },
						],
						result: [
							{ label: "IsHandled", picked: true, description: "Boolean, var: true, reason: IsHandled", variable: new ALVariable('IsHandled', 'Boolean', 'OnBeforeParametersVarSectionUnnamedReturnConstant', true), parameterPositionPrio: 10 },
							{ label: "rInt", picked: true, description: "Integer, var: true, reason: return variable", variable: new ALVariable('rInt', 'Integer', 'OnBeforeParametersVarSectionUnnamedReturnConstant', true), parameterPositionPrio: 9 },
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnBeforeParametersVarSectionUnnamedReturnConstant', false), parameterPositionPrio: 8 }
						]
					},
					{
						items: [
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturnConstant', false), parameterPositionPrio: 8 },
							{ label: "myInt", picked: false, description: "Integer, var: false, reason: local variable", variable: new ALVariable('myInt', 'Integer', 'OnAfterParametersVarSectionUnnamedReturnConstant', false), parameterPositionPrio: 7 }
						],
						result: [
							{ label: "CustomerNo", picked: true, description: "Code[20], var: false, reason: parameter", variable: new ALVariable('CustomerNo', 'Code[20]', 'OnAfterParametersVarSectionUnnamedReturnConstant', false), parameterPositionPrio: 8 },
						]
					}
				]
			})
		let workspaceEdit: WorkspaceEdit | undefined = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnBefore, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		let textEdits: TextEdit[] = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 4);
		assert.strictEqual(textEdits.shift()!.newText, ' rInt')
		assert.strictEqual(textEdits.shift()!.newText, '        IsHandled: Boolean;\r\n')
		assert.strictEqual(textEdits.shift()!.newText, 'OnBeforeParametersVarSectionUnnamedReturnConstant(CustomerNo, rInt, IsHandled);\r\n        if IsHandled then\r\n            exit;\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnBeforeParametersVarSectionUnnamedReturnConstant(CustomerNo: Code[20]; var rInt: Integer; var IsHandled: Boolean)\r\n    begin\r\n    end;\r\n')

		workspaceEdit = await codeActionProvider.getWorkspaceEditComplete(PublisherToAdd.OnAfter, new Location(doc.uri, procedureStartPos), mock);
		assert.notStrictEqual(workspaceEdit, undefined)
		workspaceEdit = workspaceEdit!

		textEdits = []
		workspaceEdit.entries().map((value: [Uri, TextEdit[]]) => value[1].forEach((value: TextEdit) => textEdits.push(value)));
		assert.strictEqual(textEdits.length, 2);
		assert.strictEqual(textEdits.shift()!.newText, 'OnAfterParametersVarSectionUnnamedReturnConstant(CustomerNo);\r\n        ')
		assert.strictEqual(textEdits.shift()!.newText, '\r\n    [IntegrationEvent(false,false)]\r\n    local procedure OnAfterParametersVarSectionUnnamedReturnConstant(CustomerNo: Code[20])\r\n    begin\r\n    end;\r\n')
		assert.strictEqual(mock.finalize(), true);
	})
});