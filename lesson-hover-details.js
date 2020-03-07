// ==UserScript==
// @name          WaniKani Lesson Hover Details
// @namespace     https://www.wanikani.com
// @description   Show lesson breakdown by type on hover
// @author        seanblue
// @version       1.1.0
// @include       https://www.wanikani.com/*
// @grant         none
// ==/UserScript==

(function(wkof, $) {
	'use strict';

	if (!wkof) {
		var response = confirm('WaniKani Lesson Hover Details script requires WaniKani Open Framework.\n Click "OK" to be forwarded to installation instructions.');

		if (response) {
			window.location.href = 'https://community.wanikani.com/t/instructions-installing-wanikani-open-framework/28549';
		}

		return;
	}

	const lessonMenuItemSelector = '.navigation .navigation-shortcut--lessons a';
	const lessonDashboardItemSelector = 'a.lessons-and-reviews__lessons-button';

    const popoverTemplate = '<div class="popover review-time"><div class="arrow"></div><div class="popover-inner"><div class="popover-content"><p></p></div></div></div>';

    const popoverConfig = {
        html: true,
        animation: false,
        placement: 'bottom',
        trigger: 'hover',
        template: popoverTemplate
    };

	const style = `<style>
	.lhd-table { display: table; margin: 0; padding: 0; }
	.lhd-row { display: table-row; margin: 0; padding: 0; }
	.lhd-cell { display: table-cell; margin: 0; font-size: 0.875rem; }
	.lhd-cell-title { font-weight: bold; padding: 0 10px 0 0; text-align: right; }
	.lhd-cell-value { text-align: left; }
</style>`;

	$('head').append(style);

	wkof.include('Apiv2');
	wkof.ready('Apiv2').then(fetchData);

	function fetchData() {
		let promises = [];
		promises.push(wkof.Apiv2.get_endpoint('summary'));
		promises.push(wkof.Apiv2.get_endpoint('subjects'));

		Promise.all(promises).then(processData);
	}

	function processData(results) {
		let lessonCounts = getLessonCount(results);
		setupMenuPopover(lessonCounts);
		setupDashboardPopover(lessonCounts);
	}

	function getLessonCount(results) {
		let summary = results[0];
		let subjects = results[1];

		let lessonCounts = {
			radical: 0,
			kanji: 0,
			vocabulary: 0
		};

		// Pull the list of subject_ids from the lesson list in 'summary'.
		let lessonSubjectIds = summary.lessons[0].subject_ids;
		lessonSubjectIds.forEach(function(subjectId) {
			let item = subjects[subjectId];
			lessonCounts[item.object]++;
		});

		return lessonCounts;
	}

	function setupMenuPopover(lessonCounts) {
		let lessonMenuItem = $(lessonMenuItemSelector);
		if (lessonMenuItem.length === 0) {
			return;
        }

		lessonMenuItem.attr('data-content', getPopoverHtml(lessonCounts)).popover(popoverConfig);
	}

	function setupDashboardPopover(lessonCounts) {
		let lessonDashboardItem = $(lessonDashboardItemSelector);
		if (lessonDashboardItem.length === 0) {
			return;
        }

		lessonDashboardItem.attr('data-content', getPopoverHtml(lessonCounts)).popover(popoverConfig);
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
})(window.wkof, window.jQuery);