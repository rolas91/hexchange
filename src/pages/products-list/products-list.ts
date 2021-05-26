import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { Service } from '../../providers/service/service';
import { Values } from '../../providers/service/values';
import { CartPage } from '../cart/cart';
import { ProductsPage } from '../products/products';
import { SearchPage } from '../search/search';
import { ProductPage } from '../product/product';
import { Post } from '../post/post';

@Component({
  selector: "page-products-list",
    templateUrl: 'products-list.html'
})
export class ProductsListPage {
    status: any;
    items: any;
    product: any;
    options: any;
    id: any;
    variationID: any;
    time: any;
    has_more_items: boolean = true;
    loading: boolean = true;
    constructor(public toastCtrl: ToastController, public nav: NavController, public service: Service, public values: Values) {
        this.items = [];
        this.options = [];
        this.service.getProducts();
    }
    doRefresh(refresher){
        this.service.load().then((results) => {
            this.handleService(results);
            refresher.complete();
        });
    }
    handleService(results){
       // 
    }
    getCategory(id, slug, name) {
        this.items.id = id;
        this.items.slug = slug;
        this.items.name = name;
        this.items.categories =  this.service.categories.filter(item => item.parent === parseInt(id));
        this.nav.push(ProductsPage, this.items);
    }
    presentToastLoginAlert() {
        let toast = this.toastCtrl.create({
          message: 'You must login to add item to wishlist',
          duration: 1000,
           position: 'bottom'
        });
        toast.present();
    }
    addToWishlist(id) {
        if (this.values.isLoggedIn) {
            this.values.wishlistId[id] = true;
            this.service.addToWishlist(id).then((results) => this.update(results, id));
        } else {
            this.presentToastLoginAlert();
        }
    }
    update(results, id) {
        if (results.success == "Success") {
            this.values.wishlistId[id] = true;
        } else {}
    }
    removeFromWishlist(id) {
        this.values.wishlistId[id] = false;
        this.service.deleteItem(id).then((results) => this.updateWish(results, id));
    }
    updateWish(results, id) {
        if (results.status == "success") {
            this.values.wishlistId[id] = false;
        }
    }
    getCart() {
        this.nav.push(CartPage);
    }
    getSearch() {
        this.nav.push(SearchPage);
    }
    mySlideOptions = {
        initialSlide: 1,
        loop: true,
        autoplay: 5800,
        pager: true
    }
    getId() {
        var i;
        if (this.options.length >= 1)
            var resa = this.options[0].split(":");
        if (this.options.length >= 2)
            var resb = this.options[1].split(":");
        if (this.options.length >= 1)
            for (i = 0; i < this.product.product.variations.length; i++) {
                if (this.product.product.variations[i].attributes[0].option == resa[1]) {
                    if (this.options.length == 1) {
                        break;
                    }
                    else if (this.product.product.variations[i].attributes[1].option == resb[1]) {
                        break;
                    }
                }
            }
    }
    goto(data){
        if(data.description == "product"){
            this.nav.push(ProductPage, data.url);   
        }
        else if(data.description == "category"){
            this.items.id = data.url;
            this.items.name = data.title;
            this.items.categories =  this.service.categories.filter(item => item.parent === parseInt(this.items.id));
            this.nav.push(ProductsPage, this.items);
        }

        else if(data.description == "post"){
            this.nav.push(Post, data.url);
        }
    }
    doInfinite(infiniteScroll) {
        this.service.loadMore().then((results) => this.handleMore(results, infiniteScroll));
    }
    handleMore(results, infiniteScroll) {
        if (!results) {
            this.has_more_items = false;
        }
        infiniteScroll.complete();
    }
    getProduct(item) {
        this.nav.push(ProductPage, item);
    }
    hideLoading(){
        this.loading = false;
    }
    getSubCategories(id){
        const results = this.service.categories.filter(item => item.parent === parseInt(id));
        return results;
    }
}