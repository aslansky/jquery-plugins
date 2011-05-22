jQuery Plugin initializer
=========================

A jQuery plugin that lets you initialize plugins via html5 data attributes.

Description
--------

Given you have a jQuery plugin that needs code like this to work:

    <body>
      <div class="tooltip">My tooltip</div>
      <script type="text/javascript">
        $('.tooltip').tooltip({
          width: 200,
          height: 200
        });
      </script>
    </body>

With the jquery-init-plugin your code would look like this:

    <body>
      <div data-plugin="tooltip" data-width="200" data-height="200">My tooltip</div>
      <script type="text/javascript">
        $('body').initPlugins();
      </script>
    </body>

If you have more than one plugin at your page the code to initialize plugins can get very confusing.
With this plugin the code gets cleaned up:

Before:

    <body>
      <div class="tooltip">My tooltip</div>
      <div class="slideshow">My slideshow</div>
      <div class="newsticker">My newsticker</div>
      <script type="text/javascript">
        $('.tooltip').tooltip({
          width: 200,
          height: 200
        });
        $('.slideshow').slideshow({
          imageCount: 10,
          imageDirectory: '../images'
        });
        $('.slideshow').slideshow({
          show: 10,
          toogle: true
          json: '../newsticker.json'
        });
      </script>
    </body>

After:

    <body>
      <div data-plugin="tooltip" data-width="200" data-height="200">My tooltip</div>
      <div data-plugin="slideshow" data-image-count="10" data-image-directory="../images">My slideshow</div>
      <div data-plugin="newsticker" data-show="10" data-toogle="true" data-json="../newsticker.json">My tooltip</div>
      <script type="text/javascript">
        $('body').initPlugins();
      </script>
    </body>
    
jquery-init-plugin can also load the plugin javascript file on demand:

    $('.tooltip').initPlugins({
        load: true,
        repository: '<path to your js files>'
    });
    
If you want to load contents of the page with ajax, use the wrapper function loadAndInit:

    <body>
      <div id="content"></div>
      <script type="text/javascript">
        $('#content').loadAndInit('content-to-load.html');
      </script>
    </body>
    
All plugins in content-to-load.html get initialized after loading.


Usage
--------
    $('element').initPlugins({
      load: false, // (boolean) enable/disable loading of plugin files, default: false
      repository: '' // directory where the js files are loaded, default: ''
    });

&nbsp;

    $('element').loadAndInit('<url>', [data], function(responseText, status, XMLHttpRequest) {
      // loadAndInit is a simple wrapper for jQuery's load function
    });