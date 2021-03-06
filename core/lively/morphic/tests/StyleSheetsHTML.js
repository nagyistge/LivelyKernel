module('lively.morphic.tests.StyleSheetsHTML').requires('lively.morphic.tests.Helper', 'lively.morphic.HTML', 'lively.morphic.StyleSheets', 'lively.morphic.StyleSheetsHTML').toRun(function() {

lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.StyleSheetsHTML.Helpers',
'running', {
    setUp: function($super) {
        $super();
    },
},
'testing', {
    test01SplitGroupedSelector: function() {
        this.assertEqualState(
            ['.test test'],
            this.morph.splitGroupedSelector('.test test'),
            'Splitting did not produce the same selector for non grouped selector');
        this.assertEqualState(
            ['.test test', 'test', '*#test > test', '.test'],
            this.morph.splitGroupedSelector('.test test, test,*#test > test   ,.test'),
            'Splitting did not work alright');
    },
    test02AddSelectorPrefixes: function() {
        this.assertEquals(
            '*[morphid="'+this.morph.id+'"] .test test, *[morphid="'+this.morph.id+'"].test test',
            this.morph.addSelectorPrefixes('.test test'),
            'Prefix were not added correctly');
        this.assertEquals(
            '*[morphid="'+this.morph.id+'"] test, test[morphid="'+this.morph.id+'"]',
            this.morph.addSelectorPrefixes('test'),
            'Tagname did not go first when the selector prefixes are added');

    },
    test03CompileStyleSheet: function() {
        var css = '.test {'+
                'color: purple;'+
                '}'+
                'test, *#test, #test-two.test3 {'+
                'border: 1px solid red;'+
                '}',

            rules = apps.cssParser.parse(css).cssRules,
            comp = this.morph.compileStyleSheet(rules),
            decomp = apps.cssParser.parse(comp).cssRules;

        this.assert((comp && comp.length > 0),
            'Compiled style sheet has to be longer than 0');
        this.assertEquals(2, decomp.length,
            'Decompiled style sheet has to have 2 rules');
    },
    test04AppendStyleNode: function() {
        var appendStyleNode = function(morph){
                    var ctx = morph.renderContext();
                    $(ctx.styleNode).remove();
                    ctx.styleNode = $('<style id="' + morph.id + '"></style>').get(0);
                    morph.appendStyleNodeHTML(
                        ctx,
                        ctx.styleNode);

                },

            morph1Level1 = lively.morphic.Morph.makeRectangle(0,0, 300, 300),
            morph2Level1 = lively.morphic.Morph.makeRectangle(0,0, 300, 300),
            morph1Level2 = lively.morphic.Morph.makeRectangle(0,0, 300, 300),
            morph2Level2 = lively.morphic.Morph.makeRectangle(0,0, 300, 300),
            morph3Level2 = lively.morphic.Morph.makeRectangle(0,0, 300, 300),
            morph1Level3 = lively.morphic.Morph.makeRectangle(0,0, 300, 300),
            morph2Level3 = lively.morphic.Morph.makeRectangle(0,0, 300, 300),
            morph3Level3 = lively.morphic.Morph.makeRectangle(0,0, 300, 300);

        /*
                11            21
              /    \          |
            12      22        32
            |      /  \
            13    23  33
        */

        morph1Level1.addMorph(morph1Level2);
        morph1Level1.addMorph(morph2Level2);
        morph2Level1.addMorph(morph3Level2);

        morph1Level2.addMorph(morph1Level3);
        morph2Level2.addMorph(morph2Level3);
        morph2Level2.addMorph(morph3Level3);

        morph1Level1.openInWorld();
        appendStyleNode(morph3Level3);
        appendStyleNode(morph1Level1);
        this.assertStyleNode(morph1Level1, morph3Level3,
            'Style node of 11 is not before 33');
        appendStyleNode(morph2Level2);

        this.assertStyleNode(morph2Level2, morph3Level3,
             'Style node of 22 is not before 33');
        this.assertStyleNode(morph1Level1, morph2Level2,
             'Style node of 11 is not before 22');



        // TODO: more asserts?

    },
    assertStyleNode: function(higherMorph, lowerMorph, msg) {
                var hCtx = higherMorph.renderContext(),
                        hStyleNode = hCtx.styleNode,
                        lCtx = lowerMorph.renderContext(),
                        lStyleNode = lCtx.styleNode;
                    this.assertEquals(
                        hStyleNode,
                        lStyleNode.previousSibling,
                        msg);


    }

});

lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.StyleSheetsHTML.StyleSheets',
'running', {
    setUp: function($super) {
        $super();
    },
},
'testing', {

    assertDOMMorphNodeAttribute: function(targetValue, attributeName, morph, msg) {
        var shapeNode= morph.renderContext().shapeNode;
        return this.assertEquals(targetValue, $(shapeNode).attr(attributeName), msg);
    },

    test01SetStyleClassNames: function() {
        this.morph.addStyleClassName('test-class');
        this.assertDOMMorphNodeAttribute('Morph test-class', 'class',
            this.morph,
            'Morph has not class names "Morph test-class"');
        this.morph.removeStyleClassName('test-class');
        this.assertDOMMorphNodeAttribute('Morph', 'class',
            this.morph,
            'Morph has not class name "Morph" after removal');
        this.morph.setStyleClassNames(['test-class']);
        this.assertDOMMorphNodeAttribute('Morph test-class', 'class',
            this.morph,
            'Morph has not class names "Morph test-class" after re-set');
    },

    test02SetStyleId: function() {
        this.morph.setStyleId('test-id');
        this.assertDOMMorphNodeAttribute('test-id', 'id',
            this.morph,
            'Morph has not id "test-id"');
    },

    test03SetStyleSheet: function() {
        this.morph.setStyleSheet('.test-class { color: black;}');
        var styleNode = this.morph.renderContext().styleNode;
        this.assert(styleNode, 'There is no style node in the render context');
        this.assertEquals('style-for-'+this.morph.id, $(styleNode).attr('id'),
            'id of style node is wrong');
        var styleNodeContent = $(styleNode).html()
        this.assert(styleNodeContent.indexOf('[morphid="'+this.morph.id.toUpperCase()+'"]') >= 0,
            'Style node content has no ref to morph');
        this.assert(styleNodeContent.indexOf('.test-class') >= 0,
            'Style node content is missing the selector');
        this.assert(styleNodeContent.indexOf('color') >= 0,
            'Style node content is missing the declaration');
    },
});

})// end of module