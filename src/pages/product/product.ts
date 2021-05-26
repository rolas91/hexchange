import { Component, ViewChild } from '@angular/core'
import { NavController, NavParams, Content } from 'ionic-angular'
import { ProductService } from '../../providers/service/product-service'
import { Values } from '../../providers/service/values'
import { Functions } from '../../providers/service/functions'
import { md5 } from './md5'
import { CartPage } from '../cart/cart'
import { AccountLogin } from '../account/login/login'
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar'
import moment from 'moment'

@Component({
  templateUrl: 'product.html',
})
export class ProductPage {
  @ViewChild(Content) content: Content
  product: any = {}
  id: any
  type: any
  status: any
  options: any
  opt: any
  message: any
  wishlist: any
  quantity: any
  reviews: any
  reviewForm: any
  nickname: any
  details: any
  BookNow: any
  disableSubmit: boolean = true
  wishlistIcon: boolean = false
  usedVariationAttributes: any = []
  selectedService: any
  selectedTime: any
  mon: any = []
  day: any
  month: any = 1
  year: any
  disableWeekDays = []
  daysConfig: DayConfig[] = []
  optionsMulti: CalendarComponentOptions = {
    pickMode: 'single',
    daysConfig: this.daysConfig,
    disableWeeks: this.disableWeekDays,
  }
  schedule: any
  NoBlockAvailable = 'NoBlockAvailable'
  WhatTime = 'WhatTime'

  constructor(
    public nav: NavController,
    public service: ProductService,
    params: NavParams,
    public functions: Functions,
    public values: Values,
  ) {
    this.options = []
    this.quantity = '1'
    this.BookNow = 'BookNow'
    if (params.data.id) {
      this.selectedService = null
      console.log(params)
      this.product.product = params.data
      this.id = params.data.id

      console.log('producto', this.product.product)

      this.options.product_id = this.id
      console.log('Product: ', this.product.product.resources_full)
      this.usedVariationAttributes = (this.product.product
        .resources_full as Array<any>).map(item => item)

      console.log('usedVariationAttributes:', this.usedVariationAttributes)
    } else {
      console.log(params.data)
      this.options.product_id = this.id
      this.service
        .getProduct(this.id)
        .then(results => this.handleProductResults(results))
    }
    this.getReviews()

    //según el horario, deshabilitamos los dias de la semana que no están definidos en el Available
    this.disableWeekDays = [0, 1, 2, 3, 4, 5, 6]
    this.product.product.availability.forEach(element => {
      let day = Number((element.type as string).split(':')[1])
      console.log({ day })
      const index = this.disableWeekDays.indexOf(day)
      if (index > -1) {
        this.disableWeekDays.splice(index, 1)
      }
    })

    console.log('this.daysConfig', this.daysConfig)
    console.log('this.disableWeekDays', this.disableWeekDays)

    //Ponemos los dias as marked (para que aparezcan de un color azul) 6 meses hacia adelante
    for (let index = 0; index < 180; index++) {
      let cur_day = moment()
        .add(index, 'days')
        .toDate()
        .getDay()
      const index_cur_day = this.disableWeekDays.indexOf(cur_day)
      if (index_cur_day > -1) {
        this.daysConfig.push({
          date: moment()
            .add(index, 'days')
            .toDate(),
          disable: true,
        })
      }

      this.daysConfig.push({
        date: moment()
          .add(index, 'days')
          .toDate(),
        marked: true,
      })
    }

    //Por defecto iniciamos con el booking deshabilitado
    this.disableSubmit = true
  }

  handleProductResults(results) {
    this.product = results
    this.usedVariationAttributes = this.product.product.attributes.filter(
      function(attribute) {
        return attribute.variation == true
      },
    )
  }
  getProduct(id) {
    this.nav.push(ProductPage, id)
    console.log(id)
  }
  addToCart() {
    // if (!this.values.isLoggedIn) {
    //   this.functions.showAlert(
    //     'Options',
    //     'Please login or create an account to continue',
    //   )
    //   this.nav.push(AccountLogin)
    // }
    //Validamos se el producto contiene resources
    if (
      this.product.product.resources_full.length > 0 &&
      !this.selectedService
    ) {
      this.functions.showAlert(
        'Options',
        'Select a service and booking information',
      )
      return
    }
    var resource_id = !this.selectedService
      ? null
      : this.selectedService.resource_id
      ? this.selectedService.resource_id
      : null

    var date = moment(this.selectedTime)
    var year = date.year()
    var month = date.month()
    var day = date.day()
    this.disableSubmit = true
    this.BookNow = 'PleaseWait'
    this.service
      .addToCart(
        resource_id,
        month,
        day,
        year,
        this.selectedTime,
        this.product.product,
      )
      .then(results => {
        this.updateCart(results)
      })
    // }
  }

  setVariations() {
    this.product.product.attributes.forEach(item => {
      if (item.selected) {
        this.options['variation[attribute_pa_' + item.name + ']'] =
          item.selected
      }
    })
    for (var i = 0; i < this.product.product.attributes.length; i++) {
      console.log(this.product.product.attributes[i].name)
      if (
        this.product.product.attributes[i].variation &&
        this.product.product.attributes[i].selected == undefined
      ) {
        this.functions.showAlert(
          'Options',
          'Please Select Product ' +
            this.product.product.attributes[i].name +
            ' Option',
        )
        return false
      }
    }
    return true
  }

  onSelect($event, id) {
    let date = new Date($event.time)
    console.log({ date })
    this.month = date.getUTCMonth() + 1 //months from 1-12
    this.day = date.getUTCDate()
    this.year = date.getUTCFullYear()
    //si cambiamos la fecha reseteamos los horarios
    this.schedule = null
    this.selectedTime = null
    this.disableSubmit = true

    if (
      this.product.product.resources_full &&
      this.product.product.resources_full.length > 0 &&
      !this.selectedService
    ) {
      this.functions.showAlert('error', 'Please select a service')
      return
    }

    var resource_id = !this.selectedService
      ? null
      : this.selectedService.resource_id
      ? this.selectedService.resource_id
      : null
    // if (this.values.isLoggedIn) {
    this.service
      .getBlocks(this.day, this.month, this.year, id, resource_id)
      .then(results => {
        let res = results as string
        let find = '<li class="block"'
        let regex = new RegExp(find, 'g')
        res = res.replace(
          regex,
          '<li class="block" ng-click="selectSchedule()" ',
        )
        console.log('schedule', res)
        var match = res.match(/data-value="(.*?)"/gi)
        if (!match) {
          this.schedule = null
          return
        }
        match.forEach((el, i, arr) => {
          arr[i] = el.replace('data-value=', '').replace(/"/g, '')
        })
        this.schedule = match
      })
  }
  update_blocks(a) {
    if (a.success == 'Success') {
      //this.functions.showAlert(a.success, a.message);
      this.values.blockslistId[this.product.product.id] = true
    } else {
      this.functions.showAlert('error', 'error')
    }
  }
  updateCart(a) {
    console.log('a:', a)
    this.disableSubmit = false
    this.values.count += parseInt(this.quantity)
    this.BookNow = 'BookNow'
    this.getCart()
  }
  getCart() {
    this.nav.push(CartPage)
  }
  mySlideOptions = {
    initialSlide: 1,
    loop: true,
    autoplay: 5800,
    pager: true,
  }
  getReviews() {
    this.service.getReviews(this.id).then(results => this.handleReview(results))
  }
  handleReview(a) {
    this.reviews = a
    for (let item in this.reviews.product_reviews) {
      this.reviews.product_reviews[item].avatar = md5(
        this.reviews.product_reviews[item].reviewer_email,
      )
    }
  }
  addToWishlist(id) {
    if (this.values.isLoggedIn) {
      this.service.addToWishlist(id).then(results => this.update(results))
    } else {
      this.functions.showAlert(
        'Warning',
        'You must login to add product to wishlist',
      )
    }
  }
  update(a) {
    if (a.success == 'Success') {
      //this.functions.showAlert(a.success, a.message);
      this.values.wishlistId[this.product.product.id] = true
    } else {
      this.functions.showAlert('error', 'error')
    }
  }
  removeFromWishlist(id) {
    this.values.wishlistId[id] = false
    this.service.deleteItem(id).then(results => this.updateWish(results, id))
  }
  updateWish(results, id) {
    if (results.status == 'success') {
      this.values.wishlistId[id] = false
    }
  }
  chooseVariation(option) {
    if (this.selectedService) {
      this.selectedService = null
      this.product.product.price = this.product.product.minPrice
    }
    this.product.product.resources_full.forEach(item => {
      if (item.resource_id == option.resource_id) {
        this.selectedService = option
        this.product.product.price = this.selectedService.price
        this.disableSubmit =
          (this.product.product.resources_full.length > 0 &&
            !this.selectedService) ||
          !this.selectedTime
      }
    })

    // this.product.product.variations.forEach(variation => {
    //   var test = new Array(this.usedVariationAttributes.length)
    //   test.fill(false)
    //   this.usedVariationAttributes.forEach(attribute => {
    //     if (variation.attributes.length == 0) {
    //       this.options.variation_id = variation.id
    //       this.product.product.in_stock = variation.in_stock
    //       this.product.product.price = variation.price
    //       this.product.product.sale_price = variation.sale_price
    //       this.product.product.regular_price = variation.regular_price
    //     } else {
    //       variation.attributes.forEach((item, index) => {
    //         if (
    //           attribute.selected &&
    //           item.name.toUpperCase() == attribute.name.toUpperCase() &&
    //           item.option.toUpperCase() == attribute.selected.toUpperCase()
    //         ) {
    //           test[index] = true
    //         }
    //       })
    //       if (test.every(v => v == true)) {
    //         this.options.variation_id = variation.id
    //         this.product.product.in_stock = variation.in_stock
    //         this.product.product.price = variation.price
    //         this.product.product.sale_price = variation.sale_price
    //         this.product.product.regular_price = variation.regular_price
    //         test.fill(false)
    //       }
    //     }
    //   })
    // })
  }

  selectTime(time) {
    this.selectedTime = time
    this.disableSubmit =
      (this.product.product.resources_full.length > 0 &&
        !this.selectedService) ||
      !this.selectedTime
  }

  getTime(item) {
    return moment(item).format('hh:mm a')
  }
}
