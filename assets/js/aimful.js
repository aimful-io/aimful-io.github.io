"use strict";

$(function() {
	let html = $('html'),
		page_wrapper = $('#top'),
		page_header = $('#page-header'),
		page_logo = $('#page-logo');

	html
		.removeClass('no-js')
		.addClass('js');

	// Initial trigger
	$(window).trigger('resize');

	let lightbox_options = {
		className: 'lightbox',
		maxWidth: '80%',
		maxHeight: '90%',
		overlayClose: true,
		reposition: true,
		returnFocus: false,
		onOpen: function() {
			html.addClass('html-frozen');
		},
		onClosed: function() {
			html.removeClass('html-frozen');
		},
		onComplete: function() {}
	};

	$(document)
		.on('click', '[rel=external]', function () {
			$(this).attr('target', '_blank').attr('rel', 'noopener'); // https://caniuse.com/#search=noopener
			return true;
		})
		.on('lightbox', function(e, custom_options) {
			$.colorbox($.extend({}, lightbox_options, custom_options || {}));
		})
		.on('click', '.to-lightbox', function(e) {
			$(document).trigger('lightbox', {
				href: $(this).attr('href'),
				inline: ($(this).attr('href').substr(0, 1) === '#'),
				className: 'lightbox ' + ($(this).data('lightbox') || ''),
				width: $(this).data('width') || 600,
				open: true,
				onComplete: function() {
					let lightbox = $('#colorbox');
					$('form', lightbox).trigger('setup');
				},
				onCleanup: function() {
					let lightbox = $('#colorbox'),
						form = $('form', lightbox);
					setTimeout(function() {
						form.trigger('reset');
					}, 250);
				}
			});

			e.preventDefault();
			return false;
		});

	if (page_wrapper.hasClass('page--home')) {
		page_logo.on('click', function() {
			$.scrollTo('#top', '#top');
			return false;
		});
	}

	if (window.location.hash) {
		let hash = $('[href="' + window.location.hash + '"]');

		if (hash.length) {
			hash.trigger('click');
		}
	}

	page_wrapper
		.waypoint(function(direction) {
			page_wrapper
				.toggleClass('with-page-header-fixed', direction === 'down');
			page_header
				.toggleClass('page-header-fixed', direction === 'down')
				.toggleClass('page-header-fixed-hidden', false);
		}, {
			offset: -90 // height of page-header element
		});

	page_wrapper
		.waypoint(function(direction) {
			page_header
				.toggleClass('page-header-fixed-visible', direction === 'down')
				.toggleClass('page-header-fixed-hidden', direction === 'up');
		}, {
			offset: -500 // should be more than height of aimful-web-hero.png (323 px)
		});

	$(document)
		.on('setup', 'form', function() {
			let form = $(this),
				form_success = $(this).next(),
				email_input = $('[type="email"]', this),
				email_field = email_input.parent(),
				email;

			email_input.off('change').on('change', function() {
				email = email_input.val();

				email_field.toggleClass('field-invalid', ! isValidEmail(email));
				$.colorbox.resize();
			});

			email_input.off('keydown').on('keydown', function() {
				email_field
					.removeClass('field-invalid')
					.removeClass('field-failed');
				$.colorbox.resize();
			});

			form.off('submit').on('submit', function(e) {
				e.preventDefault();

				email = email_input.val();

				if ( ! isValidEmail(email)) {
					email_field.addClass('field-invalid');
					$.colorbox.resize();
					return false;
				}

				form.addClass('is-loading');

				$.ajax({
					cache: false,
					data: {
						email: email,
						form: (form.attr('id').slice(0, -5))
					},
					dataType: 'json',
					method: 'POST',
					url: form.attr('action'),
					error: function(jqXHR, status, error) {
						email_field.addClass('field-failed');
						$.colorbox.resize();
					},
					success: function(data, status, jqXHR) {
						form
							.removeClass('is-loading')
							.hide();
						form_success.show();
						$.colorbox.resize();
					}
				});

				return false;
			});
		})
		.on('reset', 'form', function() {
			let form = $(this),
				form_success = $(this).next(),
				email_input = $('#email', this),
				email_field = email_input.parent();

			form
				.removeClass('is-loading')
				.show();
			form_success.hide();
			email_field
				.removeClass('field-invalid')
				.removeClass('field-failed');
		});

});