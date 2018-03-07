// ==UserScript==
// @name          WaniKani Lesson Hover Details
// @namespace     https://www.wanikani.com
// @description   Show lesson breakdown by type on hover
// @author        seanblue
// @version       1.0.1
// @include       *://www.wanikani.com/*
// @grant         none
// ==/UserScript==

(function() {
	'use strict';

	if (!window.wkof) {
		alert('WaniKani Lesson Hover Details script requires WaniKani Open Framework.\nYou will now be forwarded to installation instructions.');
		window.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
		return;
	}

	var style =	`<style>
	.lhd-table { display: table; margin: 0; padding: 0; }
	.lhd-row { display: table-row; margin: 0; padding: 0; }
	.lhd-cell { display: table-cell; margin: 0; }
	.lhd-cell-title { font-weight: bold; padding: 0 10px 0 0; text-align: right; }
	.lhd-cell-value { text-align: left; }
</style>`;

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
		return `<div class="lhd-table">
	<div class="lhd-row">
		<div class="lhd-cell lhd-cell-title">Radicals</div>
		<div class="lhd-cell lhd-cell-value">${lessonCounts.radical}</div>
	</div>
	<div class="lhd-row">
		<div class="lhd-cell lhd-cell-title">Kanji</div>
		<div class="lhd-cell lhd-cell-value">${lessonCounts.kanji}</div>
	</div>
	<div class="lhd-row">
		<div class="lhd-cell lhd-cell-title">Vocab</div>
		<div class="lhd-cell lhd-cell-value">${lessonCounts.vocabulary}</div>
	</div>
</div>`;
	}
})();