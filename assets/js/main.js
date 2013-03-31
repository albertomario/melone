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
				console.log('Could not get data from "/data/index"');
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
				console.log('Could not get data from "/data/tags"');
			}
		});
	}

	if ($('#chart-links').length) {
		$.getJSON('/data/links', function(data) {
			if (data && data.series && data.categories) {
				console.log(data);
				$('#chart-links').highcharts({
					chart: {
						type: 'bar'
					},
					title: {
						text: null
					},
					xAxis: {
						categories: data.categories,
						title: {
							text: null
						}
					},
					yAxis: {
						min: 0,
						allowDecimals: false,
						type: 'category',
						title: {
							text: 'Unqiue clicks for this url'
						}
					},
					series: data.series
				});
			} else {
				console.log('Could not get data from "/data/links"');
			}
		});
	}

	if ($('textarea[name="html"]').length) {
		CKEDITOR.replace($('textarea[name="html"]').attr('name'));
	}
});