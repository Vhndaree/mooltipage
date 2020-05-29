import { Args } from "./args";
import CliPipelineInterface from './cliPipelineInterface';
import { JSDOMPipeline } from '../lib/impl/jsdomPipeline';
import PathUtils from './pathUtils';
import CliFileSystem from './io/cliFileSystem';

export default class MooltiPageCli {
    private readonly args: Args;
    private readonly cliFs: CliFileSystem;
    private readonly pathUtils: PathUtils;

    constructor(args: Args, cliFs: CliFileSystem) {
        this.args = args;
        this.cliFs = cliFs;
        this.pathUtils = new PathUtils(cliFs);
    }

    runCompile(): void {
        if (this.cliFs.pathIsDirectory(this.args.inPath)) {
            this.runCompileBulk();
        } else {
            this.runCompileSingle();
        }
    }
    
    private runCompileBulk(): void {
        // get list of inputs to recurse through
        const pagePaths: Array<string> = this.args.pagePaths ?? [ this.args.inPath ];
        
        // extract all HTML paths from pagePaths
        const htmlFilePaths: Array<string> = this.pathUtils.extractHtmlPaths(pagePaths, this.args.inPath);
    
        // process all inputs
        this.executePipeline(this.args.inPath, this.args.outPath, htmlFilePaths);
    }
    
    private runCompileSingle(): void {
        // adjust paths for single file
        const inDir = this.cliFs.getDirectoryName(this.args.inPath);
        const outDir = this.cliFs.pathIsFile(this.args.outPath) ? this.cliFs.getDirectoryName(this.args.outPath) : this.args.outPath;
    
        // compute input file name
        const pagePaths: Array<string> = [ this.cliFs.getFileName(this.args.inPath) ];
    
        // process input file
        this.executePipeline(inDir, outDir, pagePaths);
    }
    
    private executePipeline(inDir: string, outDir: string, pagePaths: Array<string>) {
        // create FS interface mapped to provided directories
        const fsInterface: CliPipelineInterface = new CliPipelineInterface(this.cliFs, inDir, outDir);
    
        // create pipeline
        const pipeline: JSDOMPipeline = new JSDOMPipeline(fsInterface, fsInterface);
    
        // loop through each page input and process it
        for (let pagePath of pagePaths) {
            // compile the page - pipline will save automatically
            pipeline.compilePage(pagePath);
        }
    }
}