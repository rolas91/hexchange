import { Injectable } from '@angular/core'
import { URLSearchParams } from '@angular/http'
import { Headers } from '@angular/http'
declare var oauthSignature: any
var headers = new Headers()
headers.append(
  'Content-Type',
  'application/x-www-form-urlencoded; charset=UTF-8',
)

@Injectable()
export class Config {
  // url: any = 'http://localhost/hexchange'
  url: any = 'https://hexchange.digitalfactory.tech'
  consumerKey: any = 'ck_462b7613b1f89991924e149f7d7df2a1c37eb71a'
  consumerSecret: any = 'cs_81a58277089318569168ff48defefa83fa740d86'

  oauth: any
  signedUrl: any
  randomString: any
  oauth_nonce: any
  oauth_signature_method: any
  encodedSignature: any
  searchParams: any
  customer_id: any
  params: any
  options: any = {}
  constructor() {
    this.options.withCredentials = true
    this.options.headers = headers
    this.oauth = oauthSignature
    this.oauth_signature_method = 'HMAC-SHA1'
    this.searchParams = new URLSearchParams()
    this.params = {}
    this.params.oauth_consumer_key = this.consumerKey
    this.params.oauth_signature_method = 'HMAC-SHA1'
    this.params.oauth_version = '1.0'
  }
  setOauthNonce(length, chars) {
    var result = ''
    for (var i = length; i > 0; --i)
      result += chars[Math.round(Math.random() * (chars.length - 1))]
    return result
  }
  setUrl(method, endpoint, filter) {
    var key
    var unordered = {}
    var ordered = {}
    if (this.url.indexOf('https') >= 0) {
      unordered = {}
      if (filter) {
        for (key in filter) {
          unordered[key] = filter[key]
        }
      }
      unordered['consumer_key'] = this.consumerKey
      unordered['consumer_secret'] = this.consumerSecret
      Object.keys(unordered)
        .sort()
        .forEach(function(key) {
          ordered[key] = unordered[key]
        })
      this.searchParams = new URLSearchParams()
      for (key in ordered) {
        this.searchParams.set(key, ordered[key])
      }
      return this.url + endpoint + this.searchParams.toString()
    } else {
      var url = this.url + endpoint
      this.params['oauth_consumer_key'] = this.consumerKey
      this.params['oauth_nonce'] = this.setOauthNonce(
        32,
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      )
      this.params['oauth_timestamp'] = new Date().getTime() / 1000
      for (key in this.params) {
        unordered[key] = this.params[key]
      }
      if (filter) {
        for (key in filter) {
          unordered[key] = filter[key]
        }
      }
      Object.keys(unordered)
        .sort()
        .forEach(function(key) {
          ordered[key] = unordered[key]
        })
      this.searchParams = new URLSearchParams()
      for (key in ordered) {
        this.searchParams.set(key, ordered[key])
      }
      this.encodedSignature = this.oauth.generate(
        method,
        url,
        this.searchParams.toString(),
        this.consumerSecret,
      )
      return (
        this.url +
        endpoint +
        this.searchParams.toString() +
        '&oauth_signature=' +
        this.encodedSignature
      )
    }
  }
}
