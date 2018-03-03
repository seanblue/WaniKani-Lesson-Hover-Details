// ==UserScript==
// @name          WaniKani Lesson Hover Details
// @namespace     https://www.wanikani.com
// @description   Show lesson breakdown by type on hover
// @author        seanblue
// @version       1.0.0
// @include       *://www.wanikani.com/*
// @grant         none
// ==/UserScript==

(function() {
    'use strict';

	var style =
		'<style>' +
			'.table { display: table; margin: 0; padding: 0; }' +
			'.row { display: table-row; margin: 0; padding: 0; }' +
			'.cell { display: table-cell; margin: 0; }' +
			'.cell-title { font-weight: bold; padding: 0 10px 0 0; text-align: right; }' +
			'.cell-value { text-align: left; }' +
		'</style>';

	$('head').append(style);

    wkof.include('Apiv2, ItemData');
	wkof.ready('Apiv2, ItemData').then(fetchData);

	function fetchData() {
		var promises = [];
		promises.push(wkof.Apiv2.get_endpoint('summary'));
		promises.push(wkof.Apiv2.get_endpoint('subjects'));

		Promise.all(promises).then(processData);
	}

	function processData(results) {
		var lessonCounts = getLessonCount(results);
		setupPopover(lessonCounts);
	}

	function getLessonCount(results) {
		var summary = results[0];
		var subjects = results[1];

		var lessonCounts = {
			radical: 0,
			kanji: 0,
			vocabulary: 0
		};

		// Pull the list of subject_ids from the lesson list in 'summary'.
		var lessonSubjectIds = summary.lessons[0].subject_ids;
		lessonSubjectIds.forEach(function(subjectId) {
			var item = subjects[subjectId];
			lessonCounts[item.object]++;
		});

		return lessonCounts;
	}

	function setupPopover(lessonCounts) {
		var lessonMenuItem = $('.navbar .lessons a');
		if (lessonMenuItem.length === 0)
			return;

		lessonMenuItem.attr('data-content', getPopoverHtml(lessonCounts)).popover({
			html: true,
			animation: false,
			placement: 'bottom',
			trigger: 'hover',
			template: '<div class="popover review-time"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>'
		});
	}

	function getPopoverHtml(lessonCounts) {
		return `<div class="table">
	<div class="row">
    	<div class="cell cell-title">Radicals</div>
    	<div class="cell cell-value">${lessonCounts.radical}</div>
	</div>
	<div class="row">
		<div class="cell cell-title">Kanji</div>
    	<div class="cell cell-value">${lessonCounts.kanji}</div>
	</div>
	<div class="row">
		<div class="cell cell-title">Vocab</div>
    	<div class="cell cell-value">${lessonCounts.vocabulary}</div>
	</div>
</div>`;
	}
})();