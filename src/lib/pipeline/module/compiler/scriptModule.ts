import { HtmlCompilerModule, HtmlCompilerContext } from '../htmlCompiler';
import { MimeType } from '../../..';
import { InternalScriptNode, ExternalScriptNode } from '../../../dom/node';

export class ScriptModule implements HtmlCompilerModule {
    enterNode(htmlContext: HtmlCompilerContext): void {
        if (InternalScriptNode.isInternalScriptNode(htmlContext.node)) {
            // compile internal <script>
            this.compileInternalScript(htmlContext.node, htmlContext);

        } else if (ExternalScriptNode.isExternalScriptNode(htmlContext.node)) {
            // compile external <script>
            this.compileExternalScript(htmlContext.node, htmlContext);
        }
    }

    compileInternalScript(node: InternalScriptNode, htmlContext: HtmlCompilerContext): void {
        this.compileScript(htmlContext, node.scriptContent);
    }
    compileExternalScript(node: ExternalScriptNode, htmlContext: HtmlCompilerContext): void {
        const scriptConent = htmlContext.pipelineContext.pipeline.getRawText(node.src, MimeType.JAVASCRIPT);
        this.compileScript(htmlContext, scriptConent);
    }

    compileScript(htmlContext: HtmlCompilerContext, scriptText: string): void {
        // execute in parent scope, if it exists. Otherwise use local scope
        const targetCompileData = htmlContext.parentContext ?? htmlContext;

        // create eval context
        const evalContext = targetCompileData.createEvalContext();

        // compile and execute
        htmlContext.pipelineContext.pipeline.compileScript(scriptText, evalContext);

        // remove when done
        htmlContext.node.removeSelf();
        htmlContext.setDeleted();
    }
}