/*!
       _______    __        __
      / __/ (_)__/ /__ ___ / /  ___ _    __
     _\ \/ / / _  / -_|_-</ _ \/ _ \ |/|/ /
    /___/_/_/\_,_/\__/___/_//_/\___/__,__/

    =======================================

    Slideshow v0.9.2
    By Amsul (http://amsul.ca)
    Inspired by http://slidesjs.com

    Updated: 12 September, 2012

    (c) Amsul Naeem, 2012 - http://amsul.ca
    Licensed under MIT ("expat" flavour) license.
    Hosted on http://github.com/amsul/slideshow
*/

/*jshint debug: true, browser: true, devel: true */


/* */
(function( $, window, document, undefined ) {
/* */

    'use strict';


    var Slideshower = function( slideshow, options ) {

        var

            // use for public methods
            Slideshower = {},

            // use for private methods
            _self = {}



        /*
            Initialize a slideshow
        ======================================================================== */

        _self.initialize = function( slideshow, options ) {

            // store the slideshow element
            _self.elem = slideshow
            _self.$elem = $( slideshow )

            // set the new options
            _self.options = $.extend( {}, $.fn.slideshow.options, options )

            // set the stage
            _self.setStage( slideshow )

            return _self
        }



        /*
            Set the stage for a slideshow
        ======================================================================== */

        _self.setStage = function( slideshow ) {

            var
                absolutePosition = {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                }


            // store the dimensions
            _self.WIDTH = _self.elem.clientWidth
            _self.HEIGHT = _self.elem.clientHeight


            // if there is no width or height
            if ( !_self.WIDTH || !_self.HEIGHT ) {
                console.error( 'Your slideshow needs to have a width and height:', slideshow )
                return false
            }


            // wrap and contain the slideshow
            slideshow.innerHTML = '<div class="' + _self.options.container + '"><div class="' + _self.options.wrapper + '">' + slideshow.innerHTML + '</div></div>'


            // store the container while declaring the styles
            _self.$container = _self.$elem.find( '.' + _self.options.container ).css({ width: _self.WIDTH, height: _self.HEIGHT, overflow: 'hidden', position: 'relative' })


            // store the wrapper while declaring the styles
            _self.$wrap = _self.$elem.find( '.' + _self.options.wrapper ).css( absolutePosition )


            // store the slides while declaring the styles
            _self.$slides = _self.$elem.find( '.' + _self.options.slides ).css( absolutePosition ).css({ left: '100%', width: _self.WIDTH, height: _self.HEIGHT })


            // store the number of slides
            _self.SLIDES_COUNT = _self.$slides.length


            // if slideshow should auto play
            if ( _self.options.play ) {

                // set the speed based on the play option
                _self.SLIDE_SPEED = ( typeof _self.options.play === 'number' ) ? _self.options.play : 10000
            }


            // update slides to show the first one immediately
            _self.updateSlides( 0, false, 0 )


            // generate the pagination
            if ( _self.options.generatePagination ) {
                _self.generatePagination()
            }


            // generate the navigation
            if ( _self.options.generateNavigation ) {
                _self.generateNavigation()
            }


            return _self
        }



        /*
            Generate the pagination
        ======================================================================== */

        _self.generatePagination = function() {

            var
                method,

                // open the pagination list
                pagination = '<nav class="' + _self.options.pagination + '"><ul class="' + _self.options.paginationList + '">'


            // according to the number of slides, add the slide links
            for ( var i = 0, len = _self.SLIDES_COUNT; i < len; i += 1 ) {
                pagination += '<li class="' + _self.options.paginationItem + '"><a href="" data-index="' + i + '" class="' + _self.options.paginationLink + '">' + (i+1) + '</a></li>'
            }


            // close the list
            pagination += '</ul></nav>'


            // set the appending method
            if ( _self.options.paginationPrepend ) { method = 'before' }
            else { method = 'after' }

            // paint the pagination
            _self.$container[ method ]( pagination )


            // bind click events on the pagination
            _self.$pagination = _self.$elem.find( '.' + _self.options.pagination ).on( 'click', '.' + _self.options.paginationLink, _self.paginationClick )
            _self.$paginationItems = _self.$pagination.find( '.' + _self.options.paginationItem )


            // update the state of the slide pagination link
            _self.activatePagination( _self.activeSlide )

            return _self
        }



        /*
            Generate the navigation
        ======================================================================== */

        _self.generateNavigation = function() {

            var
                method,

                // create the navigation block
                navigation      =   '<nav class="' + _self.options.navigation + '">' +
                                        '<ul class="' + _self.options.navigationList + '">' +
                                            '<li class="' + _self.options.navigationItem + ' ' + _self.options.navigationPrev + '"><a href="" data-direction="prev" class="' + _self.options.navigationLink + '">Previous</a></li>' +
                                            '<li class="' + _self.options.navigationItem + ' ' + _self.options.navigationNext + '"><a href="" data-direction="next" class="' + _self.options.navigationLink + '">Next</a></li>' +
                                        '</ul>' +
                                    '</nav>'


            // set the appending method
            if ( _self.options.navigationPrepend ) { method = 'before' }
            else { method = 'after' }

            // paint the navigation
            _self.$container[ method ]( navigation )


            // bind the click events on the navigation
            _self.$navigation = _self.$elem.find( '.' + _self.options.navigation ).on( 'click', '.' + _self.options.navigationLink, _self.navigationClick )

            return _self
        }



        /*
            Change the active state of a pagination link
        ======================================================================== */

        _self.activatePagination = function( index ) {

            _self.$paginationItems.slice( index, (index+1) ).addClass( _self.options.paginationActive )
            return _self
        }

        _self.deactivatePagination = function( index ) {
            _self.$paginationItems.slice( index, (index+1) ).removeClass( _self.options.paginationActive )
            return _self
        }



        /*
            Delegate a pagination click
        ======================================================================== */

        _self.paginationClick = function( e ) {

            var rightward, holder, $button, targetSlide

            // prevent the default action
            e.preventDefault()


            // if it's animating or there's no slide change
            if ( _self.ANIMATING || targetSlide === _self.activeSlide ) {
                return _self
            }


            // assign the holder
            holder = this

            // set the target button
            $button = $( e.originalEvent.target )

            // figure out the target slide
            targetSlide = $button.data( 'index' )


            // if the direction should be rightward
            if ( targetSlide < _self.activeSlide ) {
                rightward = true
            }


            // update the slides
            _self.updateSlides( targetSlide, rightward )

            return _self
        }



        /*
            Delegate a navigation click
        ======================================================================== */

        _self.navigationClick = function( e ) {

            var holder, $button, rightward, targetSlide

            // prevent the default action
            e.preventDefault()


            // it's animating just return it
            if ( _self.ANIMATING ) {
                return _self
            }


            // assign the holder
            holder = this

            // set the target button
            $button = $( e.originalEvent.target )

            // set the direction
            rightward = ( $button.data( 'direction' ) === 'prev' )


            // figure out the target slide
            targetSlide = ( rightward ) ? _self.activeSlide - 1 : _self.activeSlide + 1

            // normalize the target slide index
            targetSlide = _self.normalizeIndex( targetSlide )


            // update the slides
            _self.updateSlides( targetSlide, rightward )

            return _self
        }



        /*
            Normalize the index of a target slide
        ======================================================================== */

        _self.normalizeIndex = function( index ) {

            // if first slide is active and `prev` is clicked
            if ( index < 0 ) {

                // set last slide as target
                index = _self.SLIDES_COUNT - 1
            }

            // if last slide is active and `next` is clicked
            else if ( index === _self.SLIDES_COUNT ) {

                // set first slide as target
                index = 0
            }

            return index
        }



        /*
            Update everything on a slide change
        ======================================================================== */

        _self.updateSlides = function( targetSlide, rightward, speed ) {

            // if the target is the active slide
            if ( targetSlide === _self.activeSlide ) {
                return _self
            }


            // update the animating status
            _self.ANIMATING = true


            // determine the speed
            if ( typeof speed !== 'number' ) {
                speed = _self.options.speed
            }


            // reset the play timer, if that
            if ( _self.options.play ) {

                // switch off the player
                clearTimeout( _self.player )

                // bind the play again
                _self.bindPlay()
            }


            // update the pagination, if set and active slide has index
            if ( _self.options.generatePagination && typeof _self.activeSlide === 'number' ) {

                _self.

                    // deactivate the current pagination
                    deactivatePagination( _self.activeSlide ).

                    // activate the target pagination
                    activatePagination( targetSlide )
            }


            // update the slides
            _self.

                // hide the active slide, possibly going `rightward`
                hideSlide( _self.activeSlide, speed, rightward ).

                // show the target slide, possibly going `rightward`
                showSlide( targetSlide, speed, rightward )


            return _self
        } //updateSlides



        /*
            Bind the slideshow auto play
        ======================================================================== */

        _self.bindPlay = function() {

            // declare the speed and default to 10 seconds
            var targetIndex


            // if there's no speed
            if ( !_self.SLIDE_SPEED ) {
                return _self
            }


            // bind the hover on pause, if that
            if ( _self.options.pauseOnHover ) {
                _self.bindHoverPause()
            }


            // animate after a timeout
            _self.player = setTimeout( function() {

                // if it's not animating
                if ( !_self.ANIMATING ) {

                    // normalize the target slide index with the slide after the active
                    targetIndex = _self.normalizeIndex( _self.activeSlide + 1 )

                    // update the slides
                    _self.updateSlides( targetIndex )
                }

            }, _self.SLIDE_SPEED )

            return _self
        } //bindPlay



        /*
            Pause the slideshow on hover
        ======================================================================== */

        _self.bindHoverPause = function() {

            // bind the listener
            _self.$elem.on({
                'mouseover.enterPause': function() {

                    // switch off the player
                    clearTimeout( _self.player )

                    // switch off the listener
                    _self.$elem.off( '.enterPause' )
                },
                'mouseleave.leavePause': function() {

                    // switch off the player
                    clearTimeout( _self.player )

                    // switch off the listener
                    _self.$elem.off( '.leavePause' )

                    // bind the play again
                    _self.bindPlay()
                }
            })

            return _self
        } //bindHoverPause



        /*
            Activate a slide with speed, effect, and callback
        ======================================================================== */

        _self.doSlidesAnimation = function( $slide, speed, rightward, callback, toHide ) {

            var effect, opaque, position, changeClass,

                // create a full callback
                fullCallback = function() {

                    // do callback
                    callback()

                    // if it's done showing and hiding
                    if ( !_self.ANIMATING_HIDE && !_self.ANIMATING_SHOW ) {

                        // set as done animating
                        _self.ANIMATING = false

                        // do the animation complete
                        _self.options.animationComplete()
                    }
                },


                // prepare to animate a slide in to view
                prepShow = function() {

                    // do animation start
                    _self.options.animationStart()


                    // if there is no speed
                    if ( !speed ) {

                        // set options to show
                        position = '0%'
                        changeClass = 'addClass'
                    }


                    // if there's a speed
                    else {


                    }
                }, //prepShow


                // prepare to animate a slide out of view
                prepHide = function() {

                    // if there is no speed
                    if ( !speed ) {

                        // set options to hide
                        position = '100%'
                        changeClass = 'removeClass'
                    }
                } //prepHide


            // prepare to hide or show
            if ( toHide ) { prepHide() }
            else { prepShow() }


            // if there's no speed
            if ( !speed ) {

                $slide.

                    // move in to position
                    css( 'left', position )

                    // change the active state class
                    [ changeClass ]( _self.options.slidesActive )

                // do the full callback
                fullCallback()
            }


            // if there's a speed
            else {

                // if the effect should be a fade
                if ( _self.options.effect === 'fade' ) {

                    // position slide to hide above the slide to show
                    if ( _self.$activeSlide && toHide ) {
                        $slide.css( 'z-index', 110 )
                    }

                    // position slide to show to position 0 and layer below slide to hide
                    if ( !toHide ) {
                        $slide.css({
                            zIndex: 100,
                            left: '0%'
                        })
                    }

                    // figure out if it's to hide or not
                    opaque = ( toHide ) ? 0 : 1

                    // assign the animation effect
                    effect = { opacity: opaque }
                }

                // otherwise default to slide effect
                else {

                    // reposition to left if needed
                    if ( !toHide && rightward ) {
                        $slide.css( 'left', '-100%' )
                    }

                    // figure out the move position
                    position    =   ( toHide ) ?
                                        ( rightward ) ? '100%' : '-100%'
                                        : '0%'

                    // assign the animation effect
                    effect = { left: position }
                }


                // do the actual animation with these settingss
                _self.animateSlide( $slide, effect, speed, fullCallback )
            }


            return _self
        } //doSlidesAnimation



        /*
            Show the specified slide
        ======================================================================== */

        _self.showSlide = function( index, speed, rightward ) {

            var $slideToActivate,

                // callback when done animating
                callback = function() {

                    // set as done showing
                    _self.ANIMATING_SHOW = false
                }

            // if there's no index or speed, just return
            if ( typeof index !== 'number' || typeof speed !== 'number' ) {
                return _self
            }


            // set this as the active slide
            _self.activeSlide = index


            // set this as slide to active
            $slideToActivate = _self.$slides.slice( index, (index+1) )


            // store the active slide
            _self.$activeSlide = $slideToActivate


            // set as animating a slide to show
            _self.ANIMATING_SHOW = true


            // move this slide in to view with speed
            _self.doSlidesAnimation( $slideToActivate, speed, rightward, callback )

            return _self
        } //showSlide




        /*
            Hide the specified slide
        ======================================================================== */

        _self.hideSlide = function( index, speed, rightward ) {

            var position, animationEffect, $slideToDeactivate,

                toHide = true,

                // callback when done animating
                callback = function() {

                    // reset the slide to the right
                    _self.resetSlide( index )

                    // set as done hiding
                    _self.ANIMATING_HIDE = false
                }


            // if there's no index or speed, just return
            if ( typeof index !== 'number' || typeof speed !== 'number' ) {
                return _self
            }


            // set as animating a slide to hide
            _self.ANIMATING_HIDE = true


            // set this as slide to deactivate
            $slideToDeactivate = _self.$slides.slice( index, (index+1) )


            // move this slide out of view
            _self.doSlidesAnimation( $slideToDeactivate, speed, rightward, callback, toHide )

            return _self
        } //hideSlide



        /*
            Animate a slide with provided settings
        ======================================================================== */

        _self.animateSlide = function( $slide, effect, speed, callback ) {

            $slide.

                // animate in to view
                stop().animate(

                    // with the assigned effect
                    effect,

                    // at the given speed
                    speed,

                    // once done, do the callback
                    callback
                )

            return _self
        } //animateSlide



        /*
            Reset the position and state of a hidden slide
        ======================================================================== */

        _self.resetSlide = function( index ) {

            _self.$slides.

                // get this slide
                slice( index, (index+1) ).

                // move to the right and reset z-index
                css({
                    left: '100%',
                    zIndex: ''
                }).

                // remove the active state
                removeClass( _self.options.slidesActive )

            return _self
        }




        /*
            And finally, we initialize then return
        ======================================================================== */

        _self.initialize( slideshow, options )


        return Slideshower
    }




    /*
        Extend jQuery
    ======================================================================== */

    $.fn.slideshow = function( options ) {
        return this.each( function() {

            if ( !$.data( this, 'slideshow' )) {

                $.data(
                    this,
                    'slideshow',
                    new Slideshower( this, options )
                )
            }

            return this
        })
    }


    // default options

    $.fn.slideshow.options = {

        container: 'slides-container', // string, Class name for slides container. Default is "slides_container"
        wrapper: 'slides-wrapper',

        slides: 'slide', // string, Class name for each slide
        slidesActive: 'active-slide', // string, Class name for current class

        generatePagination: true, // boolean, Auto generate pagination
        pagination: 'slides-pagination', // string, Class name for pagination
        paginationList: 'slides-pagination-list', // string, Class name for pagination list
        paginationItem: 'slides-pagination-item', // string, Class name for pagination items
        paginationLink: 'slides-pagination-link', // string, Class name for pagination links
        paginationActive: 'active-pagination', // string, Class name for active pagination item
        paginationPrepend: false, // boolean, prepend pagination

        generateNavigation: false, // boolean, Auto generate next/prev buttons
        navigation: 'slides-navigation', // string, Class name for navigation
        navigationList: 'slides-navigation-list', // string, Class name for navigation list
        navigationItem: 'slides-navigation-item', // string, Class name for navigation items
        navigationLink: 'slides-navigation-link', // string, Class name for navigation links
        navigationNext: 'slides-navigation-next', // string, Class name for next button
        navigationPrev: 'slides-navigation-prev', // string, Class name for previous button
        navigationPrepend: false, // boolean, prepend navigation

        speed: 350, // number, Set the speed of the animation in milliseconds
        effect: 'slide', // string, '[next/prev], [pagination]', 'slide' or 'fade'

        play: false, // number or boolean, Autoplay slideshow, a positive number will set to true and be the time between slide animation in milliseconds or true would set to default speed
        pauseOnHover: false, // boolean, Set to true and hovering over slideshow will pause it

        animationStart: function() {}, // Function called at the start of a slide animation
        animationComplete: function() {}//, // Function called at the completion of a slide animation

        //// TODO

        ///////generateProgress: false, // boolean, Set to true to show the progress between animations

        //////randomize: false, // boolean, Set to true to randomize slides
        //////pause: 0, // number, Pause slideshow on click of next/prev or pagination. A positive number will set to true and be the time of pause in milliseconds
        //////start: 1, // number, Set the speed of the sliding animation in milliseconds

        //////preload: false, // boolean, Set true to preload images in an image based slideshow
        //////preloadImage: '/img/loading.gif', // string, Name and location of loading image for preloader. Default is "/img/loading.gif"

        //////fadeSpeed: 350, // number, Set the speed of the fading animation in milliseconds
        //////fadeEasing: '', // string, must load jQuery's easing plugin before http://gsgd.co.uk/sandbox/jquery/easing/
        //////slideEasing: '', // string, must load jQuery's easing plugin before http://gsgd.co.uk/sandbox/jquery/easing/

        //////crossfade: false, // boolean, Crossfade images in a image based slideshow
        //////autoHeight: false, // boolean, Set to true to auto adjust height
        //////autoHeightSpeed: 350, // number, Set auto height animation time in milliseconds
        //////bigTarget: false, // boolean, Set to true and the whole slide will link to next slide on click

        //////slidesLoaded: function() {} // Function is called when slides is fully loaded
    }


/* */
})( jQuery, window, document )
/* */





