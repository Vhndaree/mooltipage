import test from 'ava';
import { compareFragmentMacro } from '../_util/htmlCompare';
import { MemoryPipelineInterface } from '../_mocks/memoryPipelineInterface';
import { StandardPipeline } from '../../lib/pipeline/standardPipeline';
import { MimeType } from '../../lib';

test('[endToEnd] <script> executes scripts in correct scope', compareFragmentMacro,
`<script compiled src="script.js"></script>
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `$.test = "good";`
]]);

test('[endToEnd] <script> can override existing vars', compareFragmentMacro,
`<m-var test="bad" />
<script compiled src="script.js"></script>
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `$.test = "good";`
]]);

test('[endToEnd] <script> supports multiple lines', compareFragmentMacro,
`<script compiled src="script.js"></script>
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `const foo = [];
    foo.push('g');
    foo.push('o');
    foo.push('o');
    foo.push('d');
    $.test = foo.join('');`
]]);

test('[endToEnd] <script> supports embedded functions', compareFragmentMacro,
`<script compiled src="script.js"></script>
<test value="\${ $.test }" />`,
`<test value="good"></test>`,
[[  'script.js',
    `function getGood() {
        return 'good';
    }
    $.test = getGood();`
]]);

test('[endToEnd] <script> allows script exceptions to bubble', t => {
    const errorMessage = 'test error';

    const pi = new MemoryPipelineInterface();
    pi.setSourceHtml('page.html', `<!DOCTYPE html><html><head><title>MScript Tests</title></head><body><script compiled src="script.js"></script></body></html>`);
    pi.setSource('script.js', {
        type: MimeType.JAVASCRIPT,
        content: `throw new Error('${ errorMessage }');`
    });
    const pipeline = new StandardPipeline(pi);

    t.throws(() => pipeline.compilePage('page.html'), {
        message: errorMessage
    });
});

test('[endToEnd] <script> scripts can access pipeline APIs', compareFragmentMacro,
`<script compiled src="script.js"></script>
<test value="\${ $.test }" />`,
`<test value="true"></test>`,
[[  'script.js',
    `$.test = $$.pipelineContext.pipeline !== undefined;`
]]);

test.failing('[endToEnd] <script> scripts can access NodeJS APIs', compareFragmentMacro,
`<script compiled src="script.js"></script>
<test value="\${ $.test }" />`,
`<test value="true"></test>`,
[[  'script.js',
    `const fs = require('fs');
    $.test = fs !== undefined;`
]]);

test.failing('[endToEnd] <script> scripts can access DOM APIs', compareFragmentMacro,
`<script compiled src="script.js"></script>
<test value="\${ $.test }" />`,
`<test value="true"></test>`,
[[  'script.js',
    ``
]]);

test('[endToEnd] <script> supports inline scripts', compareFragmentMacro,
`<script compiled>
    if (true) {
        this.value = 'good';
    } else {
        this.value = 'bad';
    }
</script>
<test value="\${ $.value }" />`,
'<test value="good"></test>'
);