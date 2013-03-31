$(function() {
	if ($('#chart-sent').length) {
		$.getJSON('/data/index', function(data) {
			if (data) {
				$('#chart-sent').highcharts({
					chart: {
						type: 'line',
						zoomType: 'x'
					},
					title: {
						text: null
					},
					xAxis: {
						allowDecimals: false,
						type: 'datetime',
						maxZoom: 7 * 24 * 3600000,
						dateTimeLabelFormats: {
							day: '%e. %b'
						}
					},
					yAxis: {
						min: 0,
						title: {
							text: null
						}
					},
					series: data
				});
			} else {
				console.log('Could not get data from "/data/mail"');
			}
		});
	}

	if ($('#chart-tags').length) {
		$.getJSON('/data/tags', function(data) {
			if (data) {
				$('#chart-tags').highcharts({
					chart: {
						type: 'line',
						zoomType: 'x'
					},
					title: {
						text: null
					},
					xAxis: {
						allowDecimals: false,
						type: 'datetime',
						maxZoom: 7 * 24 * 3600000,
						dateTimeLabelFormats: {
							day: '%e. %b'
						}
					},
					yAxis: {
						min: 0,
						title: {
							text: null
						}
					},
					series: data
				});
			} else {
				console.log('Could not get data from "/data/mail"');
			}
		});
	}

	if ($('textarea[name="html"]').length) {
		CKEDITOR.replace($('textarea[name="html"]').attr('name'));
	}
});