import { Component } from '@angular/core';
import { Home } from "../home/home";
import { ProductsListPage } from "../products-list/products-list";
import { WishlistPage } from '../../pages/account/wishlist/wishlist';
import { CartPage } from "../cart/cart";
import { Values } from '../../providers/service/values';
import { AccountPage } from '../../pages/account/account/account';
import { NavController, NavParams, PopoverController, ModalController } from 'ionic-angular'

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
}
)

export class TabsPage{
  Home= Home;
  productListPage= ProductsListPage;
  WishlistPage= WishlistPage;
  CartPage= CartPage;
  Values= Values;
  AccountPage= AccountPage;
  constructor(
    public nav: NavController,
    public values: Values,
    public modalCtrl: ModalController,
  ) {
    
  }

  getCart() {
    // let modal = this.modalCtrl.create(CartPage);
    // modal.present();
    this.nav.push(CartPage)
  }

}
