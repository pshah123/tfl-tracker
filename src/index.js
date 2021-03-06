datasource = "https://raw.githubusercontent.com/pshah123/tfl-tracker/vue-bootstrap/src/data.json?token=AGo0THFmoGgaxkvjaYysrlWOX8rLiTaAks5aQMv6wA%3D%3D"

Vue.component('station-search', {
  template: '#station-search',
  data: function () {
    return {
      q: '',
      stations: []
    }
  },
  methods: {
    typeahead: function () {
      this.stations = []
      if (this.q == '') return; // no res for blank queries
      topk = 10 // load 10 results
      for (let station_info of App.stations) { // hijack station list from App
        if (this.stations.length == topk) break;
        if (station_info.name.toLowerCase().indexOf(this.q.toLowerCase()) > -1)
          this.stations.push(station_info)
      }
    }
  }
})

Vue.component('station-result', {
  template: '#station-result',
  props: ['station'],
  methods: {
    pickStation: function () {
      App.station = this.station
      App.searchingStation = false
      App.searchingLines = true
      App.update()
    }
  }
})

Vue.component('line-chooser', {
  template: '#line-chooser',
  props: ['lines']
})

Vue.component('line-choice', {
  template: '#line-choice',
  props: ['lineName', 'lineCode', 'lineColor'],
  methods: {
    choose: function () {
      App.line = this.lineName
      App.lineCode = this.lineCode
      App.lineColor = this.lineColor
      App.searchingLines = false
      App.displayingResult = true
      App.update()
    }
  }
})

Vue.component('result-wrapper', {
  template: '#result',
  props: ['result', 'station', 'line', 'lineColor'],
  created: function () {
    let r = new XMLHttpRequest();
    let url = 'http://localhost:8080/'
    url = url + App.lineCode + '/' + App.station.info.code
    r.open('GET', url, false)
    r.send()
    let x = r.responseXML
    let platforms = x.getElementsByTagName('S')[0].getElementsByTagName('P')
    let res = []
    for (let platform of platforms) {
      let trains = []
      for (let train of platform.getElementsByTagName('T'))
        trains.push({
          location: train.getAttribute('Location'),
          destination: train.getAttribute('Destination'),
          timeTo: train.getAttribute('SecondsTo')
        })
      res.push({
        'name': platform.getAttribute('N'),
        'trains': trains
      })
    }
    App.result = res

  }
})

Vue.component('result-platform', {
  template: '#result-platform',
  props: ['platform']
})

Vue.component('result-train', {
  template: '#result-train',
  props: ['train'],
  data: function () {
    return {
      at: '',
      eta: '',
      dest: ''
    }
  },
  created: function () {
    this.at = this.train.location
    this.dest = this.train.destination
    let tt = this.train.timeTo
    let hrs = Math.floor(tt / 3600)
    let mins = Math.floor((this.train.timeTo - (hrs * 60)) / 60)
    let secs = Math.floor(this.train.timeTo - (hrs * 3600) - (mins * 60))
    this.eta = (hrs > 0 ? hrs + ' hours ' : '') +
      (mins > 0 ? mins + ' min ' : '') +
      (secs > 0 ? secs + ' s' : '') + ((hrs + mins + secs) > 0 ? '' : 'here');
  }
})

var App = new Vue({
  el: '#app',
  data: function () {
    return {
      stations: {},
      station: {},
      line: '',
      lineCode: '',
      lineColor: '',
      searchingStation: true,
      searchingLines: false,
      displayingResult: false,
      result: {},
      console: window.console
    }
  },
  methods: {
    update: function () {
      this.$forceUpdate()
    }
  },
  created: function () {
    $.getJSON(datasource, (json) => {
      this.stations = json
    })
  }
})