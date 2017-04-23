import { Injectable } from '@angular/core';
import { Http } from "@angular/http";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/publishReplay';
import { config } from './config';
import { TranslateService } from "@ngx-translate/core";

declare var math: any;

class RESTResource {
	constructor(private http: Http, private path, private dependencies?, private decoratorFn?) {};
	
	private json: any = {};		
	
	public available: any; 
	public get() {
	  if (!this.json || isEmpty(this.json)) {
		  this.reset();
	  }
	  return this.json;
	}
	public reset() {
	  if (this.dependencies) {
		for (let dependency of this.dependencies) dependency.get();
	  }
	  this.available = this.http.get(config.backend + this.path).map(res => res.json()).publishReplay().refCount();
	  this.available.subscribe(data => {
		if (this.decoratorFn) this.decoratorFn(data);
		Object.assign(this.json, data);
	  }, error => {}, () => {});
	}
}

//Singleton class

function isEmpty(obj) {	for (var x in obj) { return false; } return true; }

@Injectable()
export class ApiService {
  public translate: TranslateService; 
  
  public user: RESTResource;
  public titulars: RESTResource;
  public shares: RESTResource;
  
  private folios = {}
  public getFolio(id) {
	  if (!this.folios[id]) {
		   this.folios[id] = new RESTResource(this.http, '/folio/' + id, [this.titulars], data => {
			   this.titulars.available.subscribe(() => {
				   for (let share of data.shares) {
					   share.amount = this.parseFraction(share.amount);
					   share.amountStr = this.formatFraction(share.amount);
					   if (share.usufruct) share.usufructStr = this.titulars.get().titulars.find(x => x.id === share.usufruct).name;
					   if (share.bareOwner) share.bareOwnerStr = this.titulars.get().titulars.find(x => x.id === share.bareOwner).name;	
					   share.transferLink = '<button id="transfer_' + share.id + '">transfer</button>';
				   }
			   });
		   });
	  }
      return this.folios[id];
  }
  
  private transactions = {}
  public getTransactions(id) {
 	  if (!this.transactions[id]) {
		   this.transactions[id] = new RESTResource(this.http, '/transactions/' + id, [this.titulars], data => {
			   this.titulars.available.subscribe(() => {
				   for (let transaction of data.transactions) {
					   transaction.dateStr = new Date(Date.parse(transaction.date)).toLocaleDateString();
					   transaction.isSource = id == transaction.source;
					   transaction.amount = this.parseFraction(transaction.amount);
					   transaction.amountStr = this.formatFraction(transaction.amount);				   
					   if (transaction.isSource) {
						    transaction.direction = "transfered";
							if (transaction.destination) transaction.other = "to " + this.titulars.get().titulars.find(x => x.id === transaction.destination).name;
						    transaction.foBefore = this.parseFraction(transaction.sourceFOBefore);
							transaction.foAfter = this.parseFraction(transaction.sourceFOAfter);
							transaction.boBefore = this.parseFraction(transaction.sourceBOBefore);
							transaction.boAfter = this.parseFraction(transaction.sourceBOAfter);
							transaction.ufBefore = this.parseFraction(transaction.sourceUFBefore);
							transaction.ufAfter = this.parseFraction(transaction.sourceUFAfter);							
					   } else {
						    transaction.direction = "received";
							if (transaction.source) transaction.other = "from " + this.titulars.get().titulars.find(x => x.id === transaction.source).name;
						    transaction.foBefore = this.parseFraction(transaction.destFOBefore);
							transaction.foAfter = this.parseFraction(transaction.destFOAfter);
							transaction.boBefore = this.parseFraction(transaction.destBOBefore);
							transaction.boAfter = this.parseFraction(transaction.destBOAfter);
							transaction.ufBefore = this.parseFraction(transaction.destUFBefore);
							transaction.ufAfter = this.parseFraction(transaction.destUFAfter);							   
					   }
					   transaction.foBeforeStr = this.formatFraction(transaction.foBefore);
					   transaction.foAfterStr = this.formatFraction(transaction.foAfter);
					   transaction.boBeforeStr = this.formatFraction(transaction.boBefore);
					   transaction.boAfterStr = this.formatFraction(transaction.boAfter);
					   transaction.ufBeforeStr = this.formatFraction(transaction.ufBefore);
					   transaction.ufAfterStr = this.formatFraction(transaction.ufAfter);	
				   }
			   });
		   });
	  }
      return this.transactions[id];
  }	  
  constructor(private http: Http, translate: TranslateService) {
    this.user = new RESTResource(http, '/user/');
	this.titulars = new RESTResource(http, '/titulars/', [], data => {
		for (let titular of data.titulars) {
			  if (titular.corporateName) {
				  titular.name = titular.corporateName;
			  } else {
				  titular.name = titular.surname + ", " + titular.givenname;
			  }
		}
	});
	this.shares = new RESTResource(http, '/shares/', [this.titulars], data => {
		this.titulars.available.subscribe(() => {
			for (let s of data.shareholders) {
				s.bare = this.parseFraction(s.bare);
				s.usufruct = this.parseFraction(s.usufruct);
				s.full = this.parseFraction(s.fullo);
				s.fullStr = this.formatFraction(s.full); s.bareStr = this.formatFraction(s.bare); s.usufructStr = this.formatFraction(s.usufruct); 
				s.name = this.titulars.get().titulars.find(x => x.id === s.id).name;
			}
		});
	});
	
	translate.addLangs(["en", "nl", "fr"]);
	translate.setDefaultLang('en');
	let browserLang = translate.getBrowserLang();
	translate.use(browserLang.match(/en|fr|nl/) ? browserLang : 'en');
	this.translate = translate;
  }
  
  public parseFraction(frac) {
	  if (!frac) return 0; 
	  return math.fraction(parseInt(frac.n || 0) + '/' + parseInt(frac.d || 1));
  }
  
  public formatFraction(frac) {
	  if (typeof frac === 'number') return frac.toString();
	  var str = "";
	  var int_part = Math.floor(frac.n / frac.d);
	  if (int_part > 0) str += int_part;
	  frac.n -= int_part * frac.d;
	  if (frac.n > 0) {
		  if (str != "") str += "+";
		  str += math.format(frac);
	  }
	  frac.n += int_part * frac.d;
	  if (str == "") str = "0";
	  return str;
  }

}
