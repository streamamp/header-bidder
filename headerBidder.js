// StreamAMP Header Bidder v0.1
var publisher = window.location.host.match('www') ? window.location.host.split('.')[1] : window.location.host.split('.')[0]

var streamampConfig = document.createElement('script');
streamampConfig.type = 'text/javascript';
streamampConfig.async = true;
streamampConfig.src = `https://cdn.jsdelivr.net/gh/streamAMP/client-configs/${publisher}.min.js`;
streamampConfig.onload = initialize
var node = document.getElementsByTagName('script')[0];
node.parentNode.insertBefore(streamampConfig, node);

// Load GPT library
var gptLib = document.createElement('script');
gptLib.type = 'text/javascript';
gptLib.async = true;
gptLib.src = 'https://www.googletagservices.com/tag/js/gpt.js';
var node = document.getElementsByTagName('script')[0];
node.parentNode.insertBefore(gptLib, node);

// Load PBJS library
var prebid = document.createElement('script');
prebid.type = 'text/javascript';
prebid.async = true;
prebid.src = '//static.amp.services/prebid' + (streamampConfig.prebidJsVersion || '2.26.0') + '.js';
var node = document.getElementsByTagName('script')[0];
node.parentNode.insertBefore(prebid, node);

// Load apstag library
!function(a9,a,p,s,t,A,g){if(a[a9])return;function q(c,r){a[a9]._Q.push([c,r])}a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},targetingKeys:function(){return[]},_Q:[]};A=p.createElement(s);A.async=!0;A.src=t;g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)}("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");

// Initialize GPT
var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];

// Initialize PBJS
var pbjs = pbjs || {};
pbjs.que = pbjs.que || [];

function initialize() {
    
// Function to filter ad units using toggle on/off arrays
    function filterToggleOnOff() {
        var filteredAdUnits = streamampConfig.adUnits;
    
        if(window.AD_UNITS_TOGGLE_ON) {
            filteredAdUnits = streamampConfig.adUnits.filter(function(adUnit) {
                // Only keep ad units that ARE in the TOGGLE_ON array
                return window.AD_UNITS_TOGGLE_ON.indexOf(adUnit.code) !== -1;
            })
        } else {
            filteredAdUnits = streamampConfig.adUnits.filter(function(adUnit) {
                // Keep all ad units that are NOT in the TOGGLE_OFF array
                return window.AD_UNITS_TOGGLE_OFF.indexOf(adUnit.code) === -1;
            })
        }
        
        return filteredAdUnits;
    };
    
// Check if toggle on/off is in use and filter streamampConfig adUnits
    if(window.AD_UNITS_TOGGLE_ON || window.AD_UNITS_TOGGLE_OFF) {
        // Update streamampConfig adUnits to use the filteredAdUnits
        streamampConfig.adUnits = filterToggleOnOff();
    };
    
    
// Initialize CMP if enabled
    if (streamampConfig.cmp.isEnabled) {
        initializeCmp()
    };

// Checks if an object is NOT empty - for CMP styles
    function isNotEmptyCmp(obj) {
        return Object.getOwnPropertyNames(obj).length > 0;
    };

// Function to initialize CMP
    function initializeCmp() {
        var elem = document.createElement('script');
        elem.src = 'https://quantcast.mgr.consensu.org/cmp.js';
        elem.async = true;
        elem.type = "text/javascript";
        var scpt = document.getElementsByTagName('script')[0];
        scpt.parentNode.insertBefore(elem, scpt);
        (function () {
            var gdprAppliesGlobally = false;
            
            function addFrame() {
                if (!window.frames['__cmpLocator']) {
                    if (document.body) {
                        var body = document.body,
                            iframe = document.createElement('iframe');
                        iframe.style = 'display:none';
                        iframe.name = '__cmpLocator';
                        body.appendChild(iframe);
                    } else {
                        // In the case where this stub is located in the head,
                        // this allows us to inject the iframe more quickly than
                        // relying on DOMContentLoaded or other events.
                        setTimeout(addFrame, 5);
                    }
                }
            }
            
            addFrame();
            
            function cmpMsgHandler(event) {
                var msgIsString = typeof event.data === "string";
                var json;
                if (msgIsString) {
                    json = event.data.indexOf("__cmpCall") != -1 ? JSON.parse(event.data) : {};
                } else {
                    json = event.data;
                }
                if (json.__cmpCall) {
                    var i = json.__cmpCall;
                    window.__cmp(i.command, i.parameter, function (retValue, success) {
                        var returnMsg = {
                            "__cmpReturn": {
                                "returnValue": retValue,
                                "success": success,
                                "callId": i.callId
                            }
                        };
                        event.source.postMessage(msgIsString ?
                                                 JSON.stringify(returnMsg) : returnMsg, '*');
                    });
                }
            }
            
            window.__cmp = function (c) {
                var b = arguments;
                if (!b.length) {
                    return __cmp.a;
                } else if (b[0] === 'ping') {
                    b[2]({
                        "gdprAppliesGlobally": gdprAppliesGlobally,
                        "cmpLoaded": false
                    }, true);
                } else if (c == '__cmp')
                    return false;
                else {
                    if (typeof __cmp.a === 'undefined') {
                        __cmp.a = [];
                    }
                    __cmp.a.push([].slice.apply(b));
                }
            };
            window.__cmp.gdprAppliesGlobally = gdprAppliesGlobally;
            window.__cmp.msgHandler = cmpMsgHandler;
            if (window.addEventListener) {
                window.addEventListener('message', cmpMsgHandler, false);
            } else {
                window.attachEvent('onmessage', cmpMsgHandler);
            }
        })();
        
        // Initialize CMP with custom configuration
        window.__cmp('init', streamampConfig.cmp.config);
        
        // Apply custom CMP styles if true
        if (streamampConfig.cmp.hasCustomStyles && isNotEmptyCmp(streamampConfig.cmp.style)) {
            var style = document.createElement('style');
            var ref = document.querySelector('script');
            
            var quantcastTheme = streamampConfig.cmp.styles;
            
            style.innerHTML =
                // Background
                (isNotEmptyCmp(quantcastTheme.ui) && quantcastTheme.ui.backgroundColor
                 ? '.qc-cmp-ui' + '{' +
                     'background-color:' + quantcastTheme.ui.backgroundColor + '!important;' +
                     '}'
                 : '') +
                // Main Text Color
                (isNotEmptyCmp(quantcastTheme.ui) && quantcastTheme.ui.textColor
                 ? '.qc-cmp-ui,' +
                     '.qc-cmp-ui .qc-cmp-main-messaging,' +
                     '.qc-cmp-ui .qc-cmp-messaging,' +
                     '.qc-cmp-ui .qc-cmp-beta-messaging,' +
                     '.qc-cmp-ui .qc-cmp-title,' +
                     '.qc-cmp-ui .qc-cmp-sub-title,' +
                     '.qc-cmp-ui .qc-cmp-purpose-info,' +
                     '.qc-cmp-ui .qc-cmp-table,' +
                     '.qc-cmp-ui .qc-cmp-vendor-list,' +
                     '.qc-cmp-ui .qc-cmp-vendor-list-title' + '{' +
                     'color:' + quantcastTheme.ui.textColor + '!important;' +
                     '}'
                 : '') +
                // Links
                (isNotEmptyCmp(quantcastTheme.link)
                 ? '.qc-cmp-ui a,' +
                     '.qc-cmp-ui .qc-cmp-alt-action,' +
                     '.qc-cmp-ui .qc-cmp-link' + '{' +
                     (quantcastTheme.link.textColor ? 'color:' + quantcastTheme.link.textColor + '!important;' : '') +
                     (quantcastTheme.link.isUnderlined ? 'text-decoration: underline' : 'text-decoration: none' + '!important;') +
                     '}'
                 : '') +
                // Buttons
                (isNotEmptyCmp(quantcastTheme.primaryButton)
                 ? '.qc-cmp-ui .qc-cmp-button' + '{' +
                     (quantcastTheme.primaryButton.backgroundColor ? 'background-color:' + quantcastTheme.primaryButton.backgroundColor + '!important;' : '') +
                     (quantcastTheme.primaryButton.borderColor ? 'border-color:' + quantcastTheme.primaryButton.borderColor + '!important;' : '') +
                     (quantcastTheme.primaryButton.textColor ? 'color:' + quantcastTheme.primaryButton.textColor + '!important;' : '') +
                     '}'
                 : '') +
                (isNotEmptyCmp(quantcastTheme.primaryButtonHover)
                 ? '.qc-cmp-ui .qc-cmp-button:hover' + '{' +
                     (quantcastTheme.primaryButtonHover.backgroundColor ? 'background-color:' + quantcastTheme.primaryButtonHover.backgroundColor + '!important;' : '') +
                     (quantcastTheme.primaryButtonHover.borderColor ? 'border-color:' + quantcastTheme.primaryButtonHover.borderColor + '!important;' : '') +
                     (quantcastTheme.primaryButtonHover.textColor ? 'color:' + quantcastTheme.primaryButtonHover.textColor + '!important;' : '') +
                     '}'
                 : '') +
                (isNotEmptyCmp(quantcastTheme.secondaryButton)
                 ? '.qc-cmp-ui .qc-cmp-button.qc-cmp-secondary-button' + '{' +
                     (quantcastTheme.secondaryButton.backgroundColor ? 'background-color:' + quantcastTheme.secondaryButton.backgroundColor + '!important;' : '') +
                     (quantcastTheme.secondaryButton.borderColor ? 'border-color:' + quantcastTheme.secondaryButton.borderColor + '!important;' : '') +
                     (quantcastTheme.secondaryButton.textColor ? 'color:' + quantcastTheme.secondaryButton.textColor + '!important;' : '') +
                     '}'
                 : '') +
                (isNotEmptyCmp(quantcastTheme.secondaryButtonHover)
                 ? '.qc-cmp-ui .qc-cmp-button.qc-cmp-secondary-button:hover' + '{' +
                     (quantcastTheme.secondaryButtonHover.backgroundColor ? 'background-color:' + quantcastTheme.secondaryButtonHover.backgroundColor + '!important;' : '') +
                     (quantcastTheme.secondaryButtonHover.borderColor ? 'border-color:' + quantcastTheme.secondaryButtonHover.borderColor + '!important;' : '') +
                     (quantcastTheme.secondaryButtonHover.textColor ? 'color:' + quantcastTheme.secondaryButtonHover.textColor + '!important;' : '') +
                     '}'
                 : '') +
                (quantcastTheme.isSecondaryButtonHidden
                 ? '.qc-cmp-ui .qc-cmp-button.qc-cmp-secondary-button' + '{' +
                     'display: none!important;' +
                     '}' +
                     // Without the below the 'Reject all' button will not show on purpose/vendor pages
                     '.qc-cmp-ui .qc-cmp-horizontal-buttons .qc-cmp-button.qc-cmp-secondary-button,' +
                     '.qc-cmp-ui .qc-cmp-nav-bar-buttons-container .qc-cmp-button.qc-cmp-secondary-button' + '{' +
                     'display: block!important;' +
                     '}' +
                     // Without the below the 'Accept' button will be too big on the main page - mobile view
                     '@media screen and (max-width: 550px)' + '{' +
                     '.qc-cmp-buttons.qc-cmp-primary-buttons' + '{' +
                     'height: 3.8rem!important;' +
                     '}' +
                     '}'
                 : '') +
                // Tables
                (isNotEmptyCmp(quantcastTheme.tableHeader)
                 ? '.qc-cmp-ui .qc-cmp-publisher-purposes-table .qc-cmp-table-header,' +
                     '.qc-cmp-ui .qc-cmp-vendor-list .qc-cmp-vendor-row-header' + '{' +
                     (quantcastTheme.tableHeader.backgroundColor ? 'background-color:' + quantcastTheme.tableHeader.backgroundColor + '!important;' : '') +
                     (quantcastTheme.tableHeader.textColor ? 'color:' + quantcastTheme.tableHeader.textColor + '!important;' : '') +
                     '}'
                 : '') +
                (isNotEmptyCmp(quantcastTheme.tableRow)
                 ? '.qc-cmp-ui .qc-cmp-publisher-purposes-table .qc-cmp-table-row,' +
                     '.qc-cmp-ui .qc-cmp-table-row.qc-cmp-vendor-row' + '{' +
                     (quantcastTheme.tableRow.backgroundColor ? 'background-color:' + quantcastTheme.tableRow.backgroundColor + '!important;' : '') +
                     (quantcastTheme.tableRow.textColor ? 'color:' + quantcastTheme.tableRow.textColor + '!important;' : '') +
                     '}'
                 : '') +
                // Toggles
                (isNotEmptyCmp(quantcastTheme.toggleOn)
                 ? '.qc-cmp-ui .qc-cmp-toggle.qc-cmp-toggle-on,' +
                     '.qc-cmp-ui .qc-cmp-small-toggle.qc-cmp-toggle-on' + '{' +
                     (quantcastTheme.toggleOn.backgroundColor ? 'background-color:' + quantcastTheme.toggleOn.backgroundColor + '!important;' : '') +
                     (quantcastTheme.toggleOn.borderColor ? 'border-color:' + quantcastTheme.toggleOn.borderColor + '!important;' : '') +
                     '}'
                 : '') +
                (isNotEmptyCmp(quantcastTheme.toggleOff)
                 ? '.qc-cmp-ui .qc-cmp-toggle.qc-cmp-toggle-off,' +
                     '.qc-cmp-ui .qc-cmp-small-toggle.qc-cmp-toggle-off' + '{' +
                     (quantcastTheme.toggleOff.backgroundColor ? 'background-color:' + quantcastTheme.toggleOff.backgroundColor + '!important;' : '') +
                     (quantcastTheme.toggleOff.borderColor ? 'border-color:' + quantcastTheme.toggleOff.borderColor + '!important;' : '') +
                     '}'
                 : '') +
                (quantcastTheme.toggleSwitchBorderColor
                 ? '.qc-cmp-ui .qc-cmp-toggle-switch' + '{' +
                     'border: 1px solid ' + quantcastTheme.toggleSwitchBorderColor + '!important;' +
                     '}'
                 : '') +
                (quantcastTheme.toggleStatusTextColor
                 ? '.qc-cmp-ui .qc-cmp-toggle-status' + '{' +
                     'color:' + quantcastTheme.toggleStatusTextColor + '!important;' +
                     '}'
                 : '') +
                (quantcastTheme.dropdownArrowColor
                 ? '.qc-cmp-ui .qc-cmp-arrow-down' + '{' +
                     'background:' +
                     'url("data:image/svg+xml;charset=utf-8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\' stroke=\'%23' +
                     quantcastTheme.dropdownArrowColor.replace('#', '') +
                     '\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><path d=\'M2 5l6 6 6-6\'/></svg>") 50% no-repeat' +
                     '!important;' +
                     '}'
                 : '') +
                '}';
            
            ref.parentNode.insertBefore(style, ref);
        }
    }



// Initialize apstag
    apstag.init({
        pubID: '16268e26-dabe-4bf4-a28f-b8f4ee192ed3',
        adServer: 'googletag'
    });

// Define ad slots and size mapping with GPT

// Set empty arrays for GPT units and codes
    var gptSlots = [];
    var gptSlotsCodes = [];
    
    googletag.cmd.push(function () {
        function singleBreakpointSizeMapping(minWidth, sizesSuppport) {
            return googletag.sizeMapping().addSize([minWidth, 0], sizesSuppport).build()
        }
        
        function allBreakpointsSizeMapping(adunit) {
            return streamampConfig.breakpoints.map(function (breakpoint, index) {
                return singleBreakpointSizeMapping(breakpoint.minWidth, compareAdUnitBreakpointSizes(adunit, breakpoint.sizesSupported))[0]
            })
        }
        
        function compareAdUnitBreakpointSizes(adUnitSizes, breakpoints) {
            var matchingSizes = []
            breakpoints.forEach(function (breakpoint) {
                adUnitSizes.forEach(function (adUnitSize) {
                    if (JSON.stringify(breakpoint) === JSON.stringify(adUnitSize)) {
                        matchingSizes.push(breakpoint)
                    }
                })
            });
            return matchingSizes
        }
        
        function gptSizeMappingDefineSlots() {
            return streamampConfig.adUnits.map(function (adUnit) {
                var gptSlot = googletag.defineSlot(adUnit.path, adUnit.mediaTypes.banner.sizes, adUnit.code)
                    .defineSizeMapping(allBreakpointsSizeMapping(adUnit.mediaTypes.banner.sizes))
                    .addService(googletag.pubads())
                gptSlots.push(gptSlot)
                gptSlotsCodes.push(adUnit.code)
                return gptSlot
            })
        }
        
        gptSizeMappingDefineSlots();
        
        googletag.pubads().disableInitialLoad();
        googletag.pubads().collapseEmptyDivs(streamampConfig.hasCollapsedEmptyDivs);
        googletag.pubads().enableSingleRequest();
        googletag.pubads().setTargeting('scriptTesting', 'a9');
        googletag.enableServices();
    });

// Set universal timeout
    var bidTimeout = streamampConfig.bidTimeout || 2000;

// Define apstag slots
    var apstagSlots = streamampConfig.adUnits.map(function (adUnit) {
        return {
            slotID: adUnit.code,
            slotName: adUnit.path,
            sizes: adUnit.mediaTypes.banner.sizes,
        }
    });

// Define PBJS Ad Slots
    var adUnits = streamampConfig.adUnits;

// Fetch header bids
    function fetchHeaderBids() {
        // Declare header bidders
        var bidders = ['prebid'];
        
        if (streamampConfig.a9Enabled) {
            bidders = ['a9', 'prebid'];
        }
        
        // Keep track of bidders state to determine when to send ad server request
        var requestManager = {
            adserverRequestSent: false,
        };
        
        // Loop through bidder array and add the bidders to the request manager
        bidders.forEach(function (bidder) {
            requestManager[bidder] = false;
        });
        
        // Return true if all bidders have returned
        function allBiddersBack() {
            var allBiddersBack = bidders
            // Get the booleans from the object
                .map(function (bidder) {
                    return requestManager[bidder];
                })
                // Remove false values - indicates that the bidder has responded
                .filter(Boolean)
                // If length is equal to bidders, all bidders are back
                .length === bidders.length;
            return allBiddersBack;
        }
        
        // Handler for header bidder responses
        function headerBidderBack(bidder) {
            // Return early if request to adserver is already sent
            if (requestManager.adserverRequestSent === true) {
                return;
            }
            // Flip bidders back
            if (bidder === 'a9') {
                requestManager.a9 = true;
            } else if (bidder === 'prebid') {
                requestManager.prebid = true;
            }
            // If all bidders are back, send the request to the ad server
            if (allBiddersBack()) {
                sendAdServerRequest();
            }
        }
        
        // Get ads from GAM
        function sendAdServerRequest() {
            // Return early if request already sent
            if (requestManager.adserverRequestSent === true) {
                return;
            }
            // Flip boolean that keeps track of whether the ad server request was sent
            requestManager.adserverRequestSent = true;
            // Flip pbjs boolean to tell pbjs the ad server has already been called
            pbjs.adserverRequestSent = true;
            // Flip boolean for ad Sserver request to avoid duplicate requests
            requestManager.sendAdServerRequest = true;
            // Set bid targeting and make ad request to GAM
            googletag.cmd.push(function () {
                
                if (streamampConfig.a9Enabled) {
                    apstag.setDisplayBids();
                }
                
                pbjs.setTargetingForGPTAsync();
                googletag.pubads().refresh();
            });
        }
        
        // Request all bids
        function requestBids(apstagSlots, adUnits, bidTimeout) {
            // Request bids from apstag
            if (streamampConfig.a9Enabled) {
                apstag.fetchBids({
                    slots: apstagSlots,
                    timeout: bidTimeout
                }, function (bids) {
                    headerBidderBack('a9');
                });
            }
            // Request bids from prebid
            pbjs.que.push(function () {
                pbjs.addAdUnits(adUnits);
                // Set PBJ config
                pbjs.setConfig({
                    priceGranularity: streamampConfig.pbjsPriceGranularity,
                    consentManagement: {
                        cmpApi: 'iab',
                        timeout: 10000,
                        allowAuctionWithoutConsent: true,
                    },
                    userSync: {
                        userIds: [{
                            name: "pubCommonId",
                            storage: {
                                type: "cookie",
                                name: "_pubcid",
                                expires: 60
                            }
                        }, {
                            name: "unifiedId",
                            params: {
                                partner: "prebid",
                                url: "//match.adsrvr.org/track/rid?ttd_pid=prebid&fmt=json"
                            },
                            storage: {
                                type: "cookie",
                                name: "unifiedid",
                                expires: 60
                            }
                        }, {
                            name: "criteortus",
                            params: {
                                clientIdentifier: {
                                    "appnexus": 30
                                }
                            }
                        }],
                        filterSettings: {
                            iframe: {
                                bidders: '*',
                                filter: 'include'
                            }
                        },
                        syncDelay: 5000
                    },
                    // Map through the array of breakpoints to create a sizeConfig object for each breakpoint
                    sizeConfig: streamampConfig.breakpoints.map(function (breakpoint) {
                        return {
                            'mediaQuery': '(min-width: ' + breakpoint.minWidth + 'px) and (max-width: ' + breakpoint.maxWidth + 'px)',
                            'sizesSupported': breakpoint.sizesSupported,
                            'labels': [breakpoint.label],
                        }
                    }),
                });
                pbjs.requestBids({
                    bidsBackHandler: function (bidResponses) {
                        headerBidderBack('prebid');
                    }
                });
            });
        }
        
        requestBids(apstagSlots, adUnits, bidTimeout);
        
        // Set timeout to send request to call sendAdServerRequest() after timeout if all bidders haven't returned before then
        window.setTimeout(function () {
            sendAdServerRequest();
        }, bidTimeout);
    }

// function stickyAd(adUnits) {
//   var stickyAdUnits = adUnits.filter(function(adUnit) { return adUnit.isSticky === true; });
//
//   if (stickyAdUnits.length === 0) {
//     return;
//   }
//
//     pubAds.addEventListener('slotRenderEnded', function(e) {
//       if (!e.isEmpty) {
//         stickyAdUnits
//             .filter(function(adUnit) { return adUnit.code === e.slot.getSlotElementId(); })
//             .map(function(adUnit) { applyStyle(adUnit); });
//       }
//     });
//   }
//
//   function applyStyle(adUnit) {
//     var adUnitCode = adUnit.code;
//     var stickyAdPosition = adUnit.stickyAdPosition;
//
//     var adContainer = document.getElementById(adUnitCode);
//
//     if (adContainer) {
//       adContainer.style.backgroundColor = 'rgba(237, 237, 237, 0.82)';
//       adContainer.style.position = 'fixed';
//       adContainer.style.bottom = '0px';
//       adContainer.style.padding = '4px 0 0 0';
//       adContainer.style.zIndex = '9999';
//       adContainer.style.width = '100%';
//       adContainer.style.textAlign = 'center';
//
//       if (stickyAdPosition == 'bl') { // bottom left
//         adContainer.style.left = '0px';
//       } else if (stickyAdPosition == 'br') { // bottom right
//         adContainer.style.right = '0px';
//       } else { // default to be bottom center
//         adContainer.style.transform = 'translate(-50%, 0%)';
//         adContainer.style.left = '50%';
//       }
//
//       adContainer.style.display = '';
//
//       var closeAdButton = document.createElement('img');
//       closeAdButton.id = "close-button";
//       closeAdButton.src = "data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjI0cHgiIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDYxMiA2MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA2MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cG9seWdvbiBwb2ludHM9IjQyNC4wMzIsNDQzLjcgNDQzLjcsNDI0LjAzMiAzMjUuNjY3LDMwNiA0NDMuNywxODcuOTY3IDQyNC4wMzIsMTY4LjMgMzA2LDI4Ni4zMzMgMTg3Ljk2NywxNjguMyAxNjguMywxODcuOTY3ICAgICAyODYuMzMzLDMwNiAxNjguMyw0MjQuMDMyIDE4Ny45NjcsNDQzLjcgMzA2LDMyNS42NjcgICAiIGZpbGw9IiMwMDAwMDAiLz4KCQk8cGF0aCBkPSJNNjEyLDMwNkM2MTIsMTM3LjAwNCw0NzQuOTk1LDAsMzA2LDBDMTM3LjAwNCwwLDAsMTM3LjAwNCwwLDMwNmMwLDE2OC45OTUsMTM3LjAwNCwzMDYsMzA2LDMwNiAgICBDNDc0Ljk5NSw2MTIsNjEyLDQ3NC45OTUsNjEyLDMwNnogTTI3LjgxOCwzMDZDMjcuODE4LDE1Mi4zNiwxNTIuMzYsMjcuODE4LDMwNiwyNy44MThTNTg0LjE4MiwxNTIuMzYsNTg0LjE4MiwzMDYgICAgUzQ1OS42NCw1ODQuMTgyLDMwNiw1ODQuMTgyUzI3LjgxOCw0NTkuNjQsMjcuODE4LDMwNnoiIGZpbGw9IiMwMDAwMDAiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K";
//       closeAdButton.style.position = "absolute";
//       closeAdButton.style.top = "-12px";
//       closeAdButton.style.right = "3px";
//       closeAdButton.style.maxWidth = "24px";
//       closeAdButton.style.maxHeight = "24px";
//
//       // add button event
//       closeAdButton.onclick = function() {
//         adContainer.style.display = 'none';
//       };
//       adContainer.appendChild(closeAdButton);
//
//       var frame = document.getElementById("google_ads_iframe_/5548363/StreamAMP_1x1_0");
//
//       if(frame && frame.contentWindow.Tynt.length) {
//         document.getElementById("StreamAMP_1x1").style.backgroundColor = "";
//         document.getElementById("close-button").style.display = "none";
//       }
//     }
//   }
    
    function refreshBids() {
        if (streamampConfig.a9Enabled) {
            apstag.fetchBids({
                slots: apstagSlots,
                timeout: bidTimeout
            }, function (bids) {
            });
        }
        pbjs.que.push(function () {
            pbjs.requestBids({
                timeout: bidTimeout,
                adUnitCodes: gptSlotsCodes,
                bidsBackHandler: function () {
                },
            });
            if (streamampConfig.a9Enabled) {
                apstag.setDisplayBids();
            }
            pbjs.setTargetingForGPTAsync(gptSlotsCodes);
            googletag.pubads().refresh(gptSlots);
        });
    }

// If CMP is enabled, wait for consent signal before fetching header bids, else fetch header bids without waiting
    if (streamampConfig.cmp.isEnabled) {
        window.__cmp('getConsentData', null, function (data, success) {
            console.log(data)
            fetchHeaderBids(apstagSlots, adUnits, bidTimeout);
        });
    } else {
        fetchHeaderBids(apstagSlots, adUnits, bidTimeout);
    }

// Sticky Ads
    if (streamampConfig.adUnits.isSticky) {
        stickyAd(adUnits)
    }

// Refresh bids handler
    window.adRefreshTimer = null;
    
    var refreshAds = function () {
        if (window.adRefreshTimer) {
            window.clearInterval(window.adRefreshTimer);
        }
        window.adRefreshTimer = setInterval(function () {
            if (streamampConfig.hasRefreshBids) {
                refreshBids();
            }
        }, streamampConfig.refreshBidsTimeout * 1e3);
    };
    refreshAds();
    
    window.onfocus = function () {
        refreshAds();
    };
    window.onblur = function () {
        window.clearInterval(window.adRefreshTimer);
        window.adRefreshTimer = null;
    };
    
};
