import { beforeEach, expect, it } from "vitest";
import * as erp from "@/lib/erp";
import * as fin from "@/lib/finance";
import { saveContact, settlePeople, savePayrollDraft } from "@/lib/people";
import { backupJson, restoreJson } from "@/lib/backup";
beforeEach(() => localStorage.clear());
it("backs up all ERP collections, preferences and drafts without secrets", () => {
 localStorage.setItem("shopbook.account", JSON.stringify({ shopName: "Shop", currency: "KSh", password: "do-not-backup", plan: "business" }));
 const p=erp.addProduct({name:"Phone",buy:100,sell:500,qty:10});
 const c=saveContact("customers",{name:"Brian",email:"brian@example.com"});
 const sup=saveContact("suppliers",{name:"Supplier"});
 saveContact("otherContacts",{name:"Technician",category:"Repairs"});
 fin.floatDeposit("bank",10000,"DEPOSIT","Capital");
 fin.confirmPurchase({lines:[{productId:p.id,qty:2,cost:100}],pay:{cash:0,mpesa:0,bank:0,credit:200},supplierId:sup.id,updateCost:false});
 fin.addExpense({category:"Rent",amount:200,method:"bank"});
 erp.confirmSale({cart:[{productId:p.id,qty:1}],discount:0,pay:{cash:0,mpesa:0,bank:0,credit:500},customerId:c.id,channel:"POS"});
 const e=erp.addEmployee({name:"Amina",role:"Seller",comp:"salary",salary:1000,rule:{kind:"none",value:0,paidOnly:false}});
 savePayrollDraft({employeeId:e.id,from:0,to:100,deductions:0});
 localStorage.setItem("shopbook.savedReports","[]"); localStorage.setItem("shopbook.tax",JSON.stringify({on:true,rate:16}));
 const before=erp.load(), text=backupJson("Shop"); expect(text).not.toContain("do-not-backup");expect(text).not.toContain('"plan"');
 localStorage.setItem("shopbook.erp",JSON.stringify(erp.empty()));restoreJson(text);
 const after=erp.load();for(const key of Object.keys(before) as (keyof erp.ErpState)[]) if(key!=="audit") expect(after[key]).toEqual(before[key]);
 expect(JSON.parse(localStorage.getItem("shopbook.tax")||'{}')).toEqual({on:true,rate:16});
 const valid=JSON.parse(text); for(const key of Object.keys(erp.empty()).filter(k=>k!=="seq")) { const bad=structuredClone(valid);bad.data[key]="damaged"; expect(()=>restoreJson(JSON.stringify(bad))).toThrow(); }
 expect(erp.load().sales).toHaveLength(1);
});
it("partial settlements are atomic and leave original splits intact",()=>{
 const p=erp.addProduct({name:"Phone",buy:10,sell:100,qty:2});const c=saveContact("customers",{name:"Brian"});
 const sale=erp.confirmSale({cart:[{productId:p.id,qty:1}],discount:0,pay:{cash:0,mpesa:0,bank:0,credit:100},customerId:c.id,channel:"Sales"});
 settlePeople("customer",c.id,{cash:20,mpesa:30,bank:10,credit:0});const s=erp.load();expect(s.customers[0]?.balance).toBe(40);expect(s.sales[0]?.settled).toBe(60);expect(s.sales[0]?.pay).toEqual(sale.pay);
 const before=JSON.stringify(s);expect(()=>settlePeople("customer",c.id,{cash:50,mpesa:0,bank:0,credit:0})).toThrow();expect(JSON.stringify(erp.load())).toBe(before);
});
it("records product-specific commission and adjusts only returned products",()=>{
 const a=erp.addProduct({name:"A",buy:40,sell:100,qty:5}),b=erp.addProduct({name:"B",buy:20,sell:100,qty:5});
 const e=erp.addEmployee({name:"Seller",role:"Seller",comp:"commission",salary:0,rule:{kind:"percent",value:5,paidOnly:false,products:[{productId:a.id,kind:"percent",value:20}]}});
 const sale=erp.confirmSale({cart:[{productId:a.id,qty:1},{productId:b.id,qty:1}],discount:0,pay:{cash:200,mpesa:0,bank:0,credit:0},channel:"POS",sellerId:e.id});expect(erp.load().commissions[0]?.amount).toBe(25);
 erp.returnSale(sale.id,[{productId:b.id,qty:1}],"cash");expect(erp.load().commissions[0]?.amount).toBe(-5);
});
