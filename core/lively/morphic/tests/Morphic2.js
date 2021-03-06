module('lively.morphic.tests.Morphic2').requires('lively.morphic.tests.Morphic', 'lively.morphic.DiffMerge', 'lively.PartsBin').toRun(function() {

lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.PivotPointTests',
'running', {
    shouldRun: false,
    setUp: function($super) {
        $super();
        this.epsilon = 0.0001;
        lively.morphic.TransformRefactoringLayer.beGlobal();
        lively.morphic.TransformAggregationLayer.beGlobal();
    },
    tearDown: function($super) {
        $super();
        lively.morphic.TransformAggregationLayer.beNotGlobal();
    },
},
'testing', {
    test01PivotPointDoesNotAffectInnerBoundsNorBounds: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.bounds(), 'bounds before')
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.innerBounds(), 'innerbounds before');
        morph.setPivotPoint(pt(50,10));
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.bounds(), 'bounds after')
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.innerBounds(), 'innerbounds after');
    },
    test02PivotPointDoesNotAffectLocalCoordinates: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        morph.setPivotPoint(pt(50,10));
        this.assertEquals(pt(0,0), morph.getTransform().transformPoint(pt(0,0)));
    },
    test03aRotationUsesPivot: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);

        morph.setPivotPoint(pt(50, 10));
        morph.rotateBy((90).toRadians());

        this.assertEquals(rect(pt(40, -40), pt(60, 60)), morph.bounds());
    },
    test03bRotateSetPivotRotateAgain: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);

        morph.setRotation((90).toRadians()); // apply some transformation
        morph.setPivotPoint(pt(50, 10)); // coordinates local to morph
        this.assertEquals(rect(pt(-20, 0), pt(0, 100)), morph.bounds(), 'setPivotPoint wrong')

        morph.setRotation(0);

        this.assertEquals(pt(-60, 40).extent(pt(100,20)), morph.bounds());
    },
    test03cRotateWithPivotWorks: function() {
        function $t(translation, rotation, scale) { // helper
            return new lively.morphic.Similitude(translation, rotation && rotation.toRadians(), scale && pt(scale,scale))
        }

        // first calculate what is expected
        // rotate 45 degrees
        var t1 = $t(pt(0,0)),
            t2 = $t(pt(0,0), 45),
            t3 = t1.copy().inverse(),
            tStep1 = t3.preConcatenate(t2.preConcatenate(t1)), // t1 x t2 x t3
            bounds1 = [pt(0,0),pt(100,0),pt(0,20), pt(100,20)].invoke('matrixTransform', tStep1);;

        // rotate -45 degrees using pt(50,10) as pivot
        var t1 = $t(pt(50,10)).preConcatenate(tStep1), // pivot + remember transf from step 1!!!
            t2 = $t(pt(0,0), -45),
            t3 = $t(pt(-50,-10)),
            tStep2 = t3.preConcatenate(t2.preConcatenate(t1)),
            bounds2 = [pt(0,0),pt(100,0),pt(0,20), pt(100,20)].invoke('matrixTransform', tStep2);

        // now do the same with a morph and see if its bounds matches
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);
debugger
        morph.setRotation((45).toRadians());
        this.assertEquals(Rectangle.unionPts(bounds1), morph.bounds(), 'bounds wrong, step1');

        morph.setPivotPoint(pt(50,10));
        morph.setRotation((0).toRadians());
        this.assertEquals(Rectangle.unionPts(bounds2), morph.bounds(), 'bounds wrong, step2');
    },

    xtest12ModifyOrigin: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);

        morph.adjustOrigin(pt(50, 10));
        morph.rotateBy((90).toRadians());

        this.assertEqualsEpsilon(rect(pt(40, -40), pt(60, 60)), morph.getBounds());
    },
    xtest13ModifyOriginWithTransformation: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);

        morph.setRotation((90).toRadians()); // apply some transformation
        morph.adjustOrigin(pt(50, 10)); // coordinates local to morph
        this.assertEquals(rect(pt(-20, 0), pt(0, 100)), morph.bounds(), 'adjustOrigin wrong')

        morph.setRotation(0);

        this.assertEquals(pt(-60, 40).extent(pt(100,20)), morph.bounds());
    },
    xtest14ModifyOriginWithScale: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 50, 10);
        this.world.addMorph(morph);

        morph.setScale(2)
        morph.adjustOrigin(pt(25, 5)); // set origin is in local shape coordinates
        morph.rotateBy((90).toRadians());

        this.assertEquals(rect(pt(40, -40), pt(60, 60)), morph.getBounds());
    },
    xtest15ModifyOriginWithSubmorphs: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);

        var submorph = lively.morphic.Morph.makeRectangle(0, 0, 10, 10);
        morph.addMorph(submorph)
        submorph.setPosition(pt(30,30))


        morph.adjustOrigin(pt(20, 20));

        this.assertEquals(pt(10,10), submorph.getPosition(), "submorph pos did not adjust");
    },
});

lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.OriginTests',
'running', {
    setUp: function($super) {
        $super();
        this.epsilon = 0.0001;

        // we run each test method twice passing in a boolean for signaling origin with or
        // without clipping
        var realSelector = this.currentSelector.replace(/\$.*/, ''),
            useClipping = this.currentSelector.endsWith('WITH_CLIPPING');

        this[this.currentSelector] = this[realSelector].curry(useClipping);
    },
    tearDown: function($super) {
        $super();
        delete this[this.currentSelector];
    },
    allTestSelectors: function($super) {
        var methodNames = $super();
        return []
            .concat(methodNames.collect(function(ea) { return ea + '$WITHOUT_CLIPPING'}))
            .concat(methodNames.collect(function(ea) { return ea + '$WITH_CLIPPING'}));
    },
},
'testing', {
    test01OriginAffectsInnerBoundsButNotBounds: function(useClipping) {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.bounds(), 'bounds before')
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.innerBounds(), 'innerbounds before');

        if (useClipping)
            morph.applyStyle({clipMode : 'hidden'})

        morph.adjustOrigin(pt(10,10));
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.bounds(), 'bounds after')
        this.assertEquals(new Rectangle(-10, -10, 100, 20), morph.innerBounds(), 'innerbounds after');
    },
    test02OriginAffectsTransform: function(useClipping) {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);

        if (useClipping)
            morph.applyStyle({clipMode : 'hidden'})

        morph.adjustOrigin(pt(50,10));
        this.assertEquals(pt(50,10), morph.getTransform().transformPoint(pt(0,0)));
    },
    test02bOriginDoesNotAffectGlobalPositionOfSubmorphs: function(useClipping) {
        var morph1 = lively.morphic.Morph.makeRectangle(10, 10, 100, 20),
            morph2 = lively.morphic.Morph.makeRectangle(10, 10, 10, 10);
        this.world.addMorph(morph1);
        morph1.addMorph(morph2);
        this.assertEquals(pt(10,10), morph1.worldPoint(pt(0,0)));
        this.assertEquals(pt(20,20), morph2.worldPoint(pt(0,0)));

        if (useClipping)
            morph1.applyStyle({clipMode : 'hidden'})

        morph1.adjustOrigin(pt(50,10));
        // pos of morph with origin is affected
        this.assertEquals(pt(60,20), morph1.worldPoint(pt(0,0)), 'owner global pos');
        // submorph pos stays where it was
        this.assertEquals(pt(20,20), morph2.worldPoint(pt(0,0)), 'sub global pos');
    },

    test03aRotationUsesOrigin: function(useClipping) {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);

        if (useClipping)
            morph.applyStyle({clipMode : 'hidden'});

        morph.adjustOrigin(pt(50, 10));
        morph.rotateBy((90).toRadians());

        this.assertEquals(rect(pt(40, -40), pt(60, 60)), morph.bounds());
    },
    test03bRotateadjustOriginRotateAgain: function(useClipping) {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.world.addMorph(morph);

        if (useClipping)
            morph.applyStyle({clipMode : 'hidden'});

        morph.setRotation((90).toRadians()); // apply some transformation
        morph.adjustOrigin(pt(50, 10)); // coordinates local to morph
        this.assertEquals(rect(pt(-20, 0), pt(0, 100)), morph.bounds(), 'adjustOrigin wrong')

        morph.setRotation(0);

        this.assertEquals(pt(-60, 40).extent(pt(100,20)), morph.bounds());
    },
    test04ModifyOriginWithScale: function(useClipping) {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 50, 10);
        this.world.addMorph(morph);

        if (useClipping)
            morph.applyStyle({clipMode : 'hidden'});

        morph.setScale(2)
        morph.adjustOrigin(pt(25, 5)); // set origin is in local shape coordinates
        morph.rotateBy((90).toRadians());

        this.assertEquals(rect(pt(40, -40), pt(60, 60)), morph.getBounds());
    },
    test05aAddMorphWithModifiedOrigin: function(useClipping) {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50),
            m2 = new lively.morphic.Morph.makeRectangle(10,10,40,40);
        this.world.addMorph(m1);
        this.world.addMorph(m2);

        m1.adjustOrigin(pt(25,25));
        if (useClipping)
            m1.setClipMode('hidden');

        // tets if transformForNewOwner works correctly
        m1.addMorph(m2);

        // new spec by Dan: if you add m2 to m1, it should keep its position relative to $world
        this.assertEquals(pt(-15,-15), m2.getPosition(), 'submorph should not have been moved');
    },
    test06addRectangleToEllipse: function(useClipping) {
        var ellipse = new lively.morphic.Morph.makeEllipse(new Rectangle(0,0,100,100));
        var rectangle = new lively.morphic.Morph.makeRectangle(new Rectangle(0,0,100,100));
        ellipse.addMorph(rectangle);
        rectangle.setPosition(pt(0,0));

        var rPos = rectangle.getPositionInWorld();
        var ePos = ellipse.getPositionInWorld().addPt(ellipse.getOrigin());
        this.assertEquals(rPos.x, ePos.x);
        this.assertEquals(rPos.y, ePos.y);
    }

});

lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.ScrollTests',
'running', {
    setUp: function($super) {
        $super();
        this.text = new lively.morphic.Text(new Rectangle(0,0, 60, 200));
        this.world.addMorph(this.text);
        this.text.applyStyle({clipMode: 'scroll', fixedHeight: true})

        // 10x test, 9x \n\n\n
        var str = Array.range(1,10).collect(function(i) { return 'test'+i }).join('\n\n\n')
        this.text.setTextString(str);
    },
},
'testing', {

    test01ScrollSelectionAtBottomIntoView: function() {
        var m = this.text;
        m.setBorderWidth(0);

        // scroll down to be in scroll bounds
        m.setScroll(0, 0) // scroll to top
        m.setSelectionRange(m.textString.length-6,m.textString.length) // select"test10"
        m.scrollSelectionIntoView()
        // FIXME we might not want this test to make any assumptions about font sizes etc?!
        this.assert(m.getScroll()[1] > 180, 'does not scroll down');
        //this.assertMatches([0, 239], m.getScroll(), 'does not scroll down');

        // scroll up to be in scroll bounds
        m.setSelectionRange(0,5) // select "test1"

        m.scrollSelectionIntoView()
        this.epsilon = 5;
        this.assertEquals(0, m.getScroll()[1], 'does not scroll up');
    },
    test02ScrollWorld: function() {
        this.world.setExtent(pt(10000, 10000));
        this.world.setScroll(0, 0);
        this.world.setScroll(0, 10);
        this.world.setScroll(0, 10)

        this.assertMatches([0,10], this.world.getScroll())
    },

});


lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.ClipMorphTest',
'testing', {
    test01ClipModeHTML: function() {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50);
        m1.setFill(Color.red);
        m1.setClipMode('hidden');
        var expected = {
            tagName: 'div',
            childNodes: [{
                tagName: 'div', // m1's shape
                style: {overflow: 'hidden', backgroundColor: Color.red.toString()}
            }]
        }
        this.assertNodeMatches(expected, m1.renderContext().getMorphNode());
    },
    test02DisableClipModeRemovesElement: function() {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50);
        m1.setFill(Color.red);
        m1.setClipMode('hidden');
        m1.setClipMode('visible');
        var expected = {
            tagName: 'div',
            childNodes: [{
                tagName: 'div', // m1's shape node
                style: {backgroundColor: Color.red.toString()}
            }]
        }
        this.assertNodeMatches(expected, m1.renderContext().getMorphNode());
    },
    test03NewMorphsAreAppendedToClipNode: function() {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50),
            m2 = new lively.morphic.Morph.makeRectangle(0,0,50,50);
        m2.setFill(Color.red);
        m1.setClipMode('hidden');
        m1.addMorph(m2);
        var expected = {
            tagName: 'div', // m1
            childNodes: [{
                tagName: 'div', // m1's shape
                style: {overflow: 'hidden'},
                childNodes: [
                    {tagName: 'div', /* m1's submorphNode */ childNodes: [
                        {tagName: 'div', /* m2 */ childNodes: [{
                            tagName: 'div', // m2's shape
                            style: {backgroundColor: Color.red.toString()}
                        }]
                    }]
                }]
            }]
        }
        this.assertNodeMatches(expected, m1.renderContext().getMorphNode());
    },
    test04aBoundsWithClipModeAndOrigin: function() {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50);
        this.world.addMorph(m1);

        m1.setClipMode('hidden');
        m1.adjustOrigin(pt(25,25));
        this.assertEquals(pt(25,25), m1.getPosition(), 'pos');
        this.assertEquals(new Rectangle(0,0,50,50), m1.bounds(), 'bounds');
    },
    test04bBoundsWithoutClipModeAndWithOrigin: function() {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50);
        this.world.addMorph(m1);

        m1.adjustOrigin(pt(25,25));
        this.assertEquals(pt(25,25), m1.getPosition(), 'pos');
        this.assertEquals(new Rectangle(0,0,50,50), m1.bounds(), 'bounds');
    },
    test04cBoundsWithClipModeAndOriginAndSubmorph: function() {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50),
            m2 = new lively.morphic.Morph.makeRectangle(10,10,40,40);;
        this.world.addMorph(m1);
        m1.addMorph(m2);

        m1.setClipMode('hidden');
        m1.adjustOrigin(pt(25,25));
        this.assertEquals(pt(25,25), m1.getPosition(), 'pos');
        this.assertEquals(new Rectangle(0,0,50,50), m1.bounds(), 'bounds');
    },
    test05aadjustOriginAndEnableClipping: function() {
        var m1 = new lively.morphic.Morph.makeRectangle(0,0,50,50),
            m2 = new lively.morphic.Morph.makeRectangle(10,10,40,40);
        this.world.addMorph(m1);
        m1.addMorph(m2);

        m1.adjustOrigin(pt(25,25));
        m1.setClipMode('hidden');
        this.assertEquals(pt(25,25), m1.getPosition(), 'pos');
        this.assertEquals(new Rectangle(0,0,50,50), m1.bounds(), 'bounds');
        this.assertEquals(pt(-15,-15), m2.getPosition(), 'pos sub');
    },

    test06OriginAffectsInnerBoundsButNotBounds: function() {
        var morph = lively.morphic.Morph.makeRectangle(0, 0, 100, 20);
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.bounds(), 'bounds before')
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.innerBounds(), 'innerbounds before');
        morph.applyStyle({clipMode : 'hidden'});
        morph.adjustOrigin(pt(10,10));
        this.assertEquals(new Rectangle(0, 0, 100, 20), morph.bounds(), 'bounds after')
        this.assertEquals(new Rectangle(-10, -10, 100, 20), morph.innerBounds(), 'innerbounds after');
    }

});

lively.morphic.tests.MorphTests.subclass('lively.morphic.tests.DiffMergeTests',
'inheritance', {
    testFindById: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        var m1_1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        var m1_2 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        var m1_1_1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m1.addMorph(m1_1);
        m1_1.addMorph(m1_1_1);
        m1.addMorph(m1_2);
        this.assertEquals(m1.findById(m1_1.id), m1_1, 'First submorph not found.')
        this.assertEquals(m1.findById(m1_1_1.id), m1_1_1, 'Submorph of submorph not found.')
        this.assertEquals(m1.findById(m1_2.id), m1_2, 'Second Submorph not found.')
    },

    testFindParentPartVersion: function() {
        var getPartItemFactory = function () {
            return {part: this,
                    loadPart: function () {
                        return {part: this,
                                loadPart: function () {
                                    return this;
                                }.bind(this)}
                    }.bind(this)}
        };

        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        var m2 = lively.morphic.Morph.makeRectangle(0,0,100,100)
        m1.getPartsBinMetaInfo().revisionOnLoad = 2;
        m1.getPartItem = getPartItemFactory;

        this.assertEquals(m1.findParentPartVersion().getPartsBinMetaInfo().revisionOnLoad, m1.getPartsBinMetaInfo().revisionOnLoad, 'Revision number of current revision was wrong.')

        this.assert(!m2.findParentPartVersion().getPartsBinMetaInfo().revisionOnLoad, "Should't have found a match");
    },

    testFindCurrentPartVersion: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100),
            test = this;
        m1.name = "m1";
        m1.getPartsBinMetaInfo().revisionOnLoad = 2;
        m1.getPartItem = function () {
            return {
                part: this,
                loadPart: function () { return {part: this} }.bind(this),
                getFileURL: function() {
                    var url = URL.root.withFilename('PartsBin/' + this.name + ".json");
                    test.spy(url, "asWebResource", function () {return {exists: Functions.True}});
                    return url;
                }.bind(this)
            }
        };
        this.assertEquals(m1.getPartsBinMetaInfo().revisionOnLoad,
            m1.findCurrentPartVersion().getPartsBinMetaInfo().revisionOnLoad,
            'Wrong revision number')
    },

    testFindDerivationParent: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100)
        m1.derivationIds = [1];
        var m2 = m1.copy().copy(); // copyToPartsBin simulated

        this.assert(m2.findDerivationParent(m1), "No parent found.")
        this.assert(m2.findDerivationParent(m1) === m1, "Wrong parent found 1.")

        var m3 = lively.morphic.Morph.makeRectangle(0,0,100,100)
        m3.derivationIds = [1];
        var m6 = lively.morphic.Morph.makeRectangle(0,0,100,100)
        m6.derivationIds = [1];

        m1.addMorph(m3);
        m3.addMorph(m6);
        var m4 = m1.copy()
        var m5 = m4.copy(); //simulate copyToPartsBin

        this.assert(m5.submorphs[0].findDerivationParent(m4) === m4.submorphs[0], "Wrong parent found 2.")
        this.assert(m5.submorphs[0].submorphs[0].findDerivationParent(m4) === m4.submorphs[0].submorphs[0], "Wrong parent found 3.")
    },
    testFindDerivationSibling: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        var m2 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m1.addMorph(m2);
        var m6 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m2.addMorph(m6);
        //simulate copyToPartsBin
        var m3 = m1.copy();
        //simulate copyFromPartsBin
        var m4 = m3.copy();
        var m5 = m3.copy();
        this.assertEquals(m5.submorphs[0].findDerivationSibling(m4), m4.submorphs[0], 'wrong derivation sibling')
    },



    testIsDirectDescendentOf: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m1.derivationIds = [1];
        var m2 = m1.copy();
        this.assert(m2.isDirectDescendentOf(m1), 'found m2 not as descendent');
        var m3 = m1.copy();
        this.assert(!m3.isDirectDescendentOf(m2), 'found m3 as descendent');
        var m4 = m3.copy();
        this.assert(m4.isDirectDescendentOf(m1), 'found m4 not as descendent of m1')
        this.assert(m4.isDirectDescendentOf(m3), 'found m4 not as descendent of m3')
    },

    testExistsAlreadyIn: function(parent) {
        // todo: only the existment property of direct descendents is tested! Find out, what the other UseCase is, and test it.
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        var m2 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m1.addMorph(m2)
        var pbv = m1.copy();
        var m4 = pbv.copy(); // simulate copyToPartsBin

        m4.isDirectDescendentOf = function () {return true};
        m4.submorphs[0].isDirectDescendentOf = function () {return true};

        this.assert(m4.existsAlreadyIn(pbv), "Should exist in first generation")
        this.assert(m4.submorphs[0].existsAlreadyIn(pbv), "submorph should exist in first generation");
        var m5 = m4.copy().copy(); // simulate copyToPartsBin
        m5.submorphs[0].isDirectDescendentOf = function () {return true};
        this.assert(m5.submorphs[0].existsAlreadyIn(pbv), "should exist in second generation");
    },

    testFindSiblingInRelative: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m1.derivationIds = [1]
        var m2 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m2.derivationIds = [1]

        var m4 = m1.copy().copy(); // simulate copyToPartsBin
        m4.addMorph(m2)
        var m6 = m4.copy().copy(); // simulate copyToPartsBin
        var m7 = m4.copy().copy(); // simulate copyToPartsBin
        var m8 = m6.copy().copy(); // simulate copyToPartsBin
        m7.submorphs[0].remove()

        this.assertEquals(m6.findSiblingInRelative(m7, m4), m7, 'Wrong sibling with real parent');
        this.assertEquals(m6.submorphs[0].findSiblingInRelative(m7, m4), m7.submorphs[0], 'Wrong submorphs sibling with real parent')
        this.assertEquals(m8.findSiblingInRelative(m7, m4), m7, 'Wrong sibling with grand parent')
        this.assert(!m8.submorphs[0].findSiblingInRelative(m7, m4), 'Wrong submorph sibling with grand parent')
    },

},
'diffing', {
    testCopy: function() {
            var m = lively.morphic.Morph.makeRectangle(0,0,100,100);
            var m2 = m.copy();
            this.assert(m2.derivationIds, "No derivationsIds Array")
    },
    testDiffTo: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        var m2 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m1.addMorph(m2);
        // simulate copyToPartsBin
        var pbv = m1.copy();
        // simulate copyFromPartsBin
        var m3 = pbv.copy();
        var m4 = m3.copy();
        // this.assert(!m4.diffTo(m3), "found changes, but there weren't some")
        // required in three way diff, therefore staying
        var m5 = lively.morphic.Morph.makeRectangle(0,0,100,100);
        m4.addMorph(m5)

        //added morphs
        this.assert(m4.diffTo(m3), "no changes found")
        this.assert(m4.diffTo(m3)[m4.id].added[m5.id], "no addition found")
        this.assertEquals(m4.diffTo(m3)[m4.id].added[m5.id],m5, "wrong addition found")

        //removed morphs
        var m6 = m4.copy();
        m6.submorphs[1].remove();
        this.assert(m6.diffTo(m4)[m6.id].removed[m5.id], "no removal found")
        this.assertEquals(m6.diffTo(m4)[m6.id].removed[m5.id], m5, "wrong removal found");

        //modified morphs
        m6.setFill(Global.Color.red);
        this.assert(m6.diffTo(m4)[m6.id].modified['Fill'], "no removal found")

        //submorphsModified
        this.assert(m4.diffTo(m3)[m4.id].submorphsModified.length >= 0, 'submorphs were not modified')
    },
},
'equals extensions', {
    testGradientEquals: function() {
        var color = Color.red;
        var a = new lively.morphic.LinearGradient([
                {offset: 0, color: color.mixedWith(Color.white, 0.4)},
                {offset: 0.5, color: color.mixedWith(Color.white, 0.8)},
                {offset: 1, color: color.mixedWith(Color.black, 0.9)}], "northsouth");
        var b = new lively.morphic.LinearGradient([
                {offset: 0, color: color.mixedWith(Color.white, 0.4)},
                {offset: 0.5, color: color.mixedWith(Color.white, 0.8)},
                {offset: 1, color: color.mixedWith(Color.black, 0.9)}], "northsouth");
        var c = new lively.morphic.LinearGradient([
                {offset: 0, color: color.mixedWith(Color.white, 0.4)},
                {offset: 0.5, color: color.mixedWith(Color.white, 0.8)},
                {offset: 1, color: color.mixedWith(Color.black, 0.9)}], "northwest");
        color = Color.green;
        var d = new lively.morphic.LinearGradient([
                {offset: 0, color: color.mixedWith(Color.white, 0.4)},
                {offset: 0.5, color: color.mixedWith(Color.white, 0.8)},
                {offset: 1, color: color.mixedWith(Color.black, 0.9)}], "northsouth");
        this.assert(a.equals(b),'equal vectors were not equal');
        this.assert(!a.equals(c),'the vectors should not have been the same');
        this.assert(!a.equals(d),'the colors should not have been the same');
    },

    testMorphEquals: function() {
        var m1 = lively.morphic.Morph.makeRectangle(0,0,100,100),
            m2 = m1.copy();
        this.assert(m1.equals(m2), "Morphs are not equal after copying");
    },

    testMorphEqualsWithPartsBinMorphs: function() {
        if (Config.serverInvokedTest) return; // Not yet PB access
        var m1 = $world.loadPartItem("Rectangle", "PartsBin/Basic"),
            m2 = $world.loadPartItem("Rectangle", "PartsBin/Basic"),
            m3 = m1.copy();
        this.assert(m1.equals(m2), "Morphs that were both loaded from the same part are not equal");
        this.assert(m1.equals(m3), "Morphs are not equal after copying");
    },

},
'atomic diff', {
    testDiffAgainst: function() {
        var d1 = new AtomicDiff("property", Color.gray, Color.red);
        var d2 = new AtomicDiff("property", Color.green, Color.red);
        var d3 = new AtomicDiff("property", Color.green, Color.red);
        var d4 = new AtomicDiff("property", Color.green, Color.red);

        var diff = d1.diffAgainst(d2);
        var noDiff = d2.diffAgainst(d3);
        var diff2 = d3.diffAgainst(d4);

        this.assert(diff, 'no diff found');
        this.assert(!noDiff,'should not have diffed');
        this.assertEquals(diff.type, "property", "wrong type");
        this.assertEquals(diff.newValue, Color.gray, "wrong newValue");
        this.assertEquals(diff.oldValue, Color.green, "wrong oldValue");
        this.assert(!diff2, 'should have found no diff')

    },
    testDiffAgainst: function() {
        var f1 = function () {
            alertOK("foo")
        }
        var f2 = function () {
            alertOK("foo")
        }
        var f3 = function () {
            alertOK("foobar")
        }

        var ad1 = new AtomicDiff('script', f1, f2);
        var ad2 = new AtomicDiff('script', f1, f2);
        var ad3 = new AtomicDiff('script', f3, f2);

        this.assert(!ad1.diffAgainst(ad2), 'Should not have found a diff')
        this.assert(ad1.diffAgainst(ad3), 'Should have found a diff')
    },
},
'diff', {
    testIsEmpty: function() {
        var d1 = new Diff();
        var d2 = new Diff({});
        var d3 = new Diff({added: {abc:"123"}});
        this.assert(d1.isEmpty(), 'new diff was not empty');
        this.assert(d2.isEmpty(), 'empty diff was not empty');
        this.assert(!d3.isEmpty(), 'filled diff was empty');
    },
},
'diff list', {
    testMixWith: function() {
        var l1 = new DiffList(),
            l2 = new DiffList(),
            l3 = new DiffList();
        l2["123"] = new Diff(
            {"added1": "", "added2": ""},
            {"removed1": ""},
            {"modified1": "", "modified2": ""}
        );
        l3["abc"] = new Diff(
            {"addedA": ""},
            {"removedA": ""},
            {"modifiedA": "", "modifiedB": ""}
        );
        this.assertEquals(l1.mixWith(l2)["123"].added.added1, "",
            'wrong list when adding to empty')
        this.assertEquals(l2.mixWith(l1)["123"].added.added1, "",
            'wrong list when adding empty')
        this.assertEquals(l2.mixWith(l3)["123"].added.added1, "",
            'wrong list when adding to filled 1')
        this.assertEquals(l2.mixWith(l3)["abc"].added.addedA, "",
            'wrong list when adding to filled 2')
    },
    testIsEmpty: function() {
        var l1 = new DiffList();
        var l2 = new DiffList();
        l2["123"] = new Diff({});
        var l3 = new DiffList();
        l3["123"] = new Diff({"added1" : ""});
        this.assert(l1.isEmpty(), 'new List was not empty');
        this.assert(l2.isEmpty(), 'list with empty diff was not empty');
        this.assert(!l3.isEmpty(), 'filled list was empty')
    },
    testDiffAgainst: function() {
        var c1 = new AtomicDiff("color", "property", Color.blue, Color.green),
            c2 = new AtomicDiff("borderColor", "property", Color.gray, Color.green),
            b1 = new AtomicDiff("color", "property", Color.yellow, Color.green),
            b2 = new AtomicDiff("borderColor", "property", Color.gray, Color.green),
            b3 = new AtomicDiff("size", "property", 1, 0);

        var d1 = new Diff({"123" : {"m1":"morph1"}},{"456" : {"m2":"morph2"}},{color:c1, borderColor:c2}),
            d2 = new Diff({},{},{color:b1, borderColor:b2, size:b3}),
            d3 = new Diff({"ABC" : {"m2":"morph2"}}, {"ABC" : {"m2":"morph2"}} );
    },

});

}) // end of module