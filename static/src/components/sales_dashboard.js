/** @odoo-module */

import { registry } from "@web/core/registry"
import { KpiCard } from "./kpi_card/kpi_card"
import { ChartRenderer } from "./chart_renderer/chart_renderer"
import { loadJS } from "@web/core/assets"
const { Component, onWillStart, useRef, onMounted ,useState} = owl
import { useService } from "@web/core/utils/hooks";
import { jsonrpc } from "@web/core/network/rpc_service";
export class OwlSalesDashboard extends Component {
    setup(){
           this.orm = useService("orm");
           this.actionService = useService("action");
           this.rpc = useService("rpc");

           this.state = useState({
            partners: [],

        });
         onMounted(async () => {
            const res = await fetch("/api/all/partners");
            const data = await res.json();
            console.log(data)
            this.state.partners = data;
             const result = await this.rpc("/dashboard/sales_chart");
            this.state.chart_image = "data:image/png;base64," + result.image;

        });


        onWillStart(async () => {
            this.quo = await this.orm.searchCount("sale.order", [["state", "=", "draft"]]);
            this.sale = await this.orm.searchCount("sale.order", [["state", "=", "sale"]]);
            const ids = await this.orm.search(
                "sale.order",
                [["state", "=", "sale"]]
             );
            console.log('jjjjjjjjjj',ids)

//            const result = await this.rpc("/odoo_custom_dashboard/get_data", {});
//            this.state.data = result;
//            console.log("Partners from controller: ", this.state.data );
//                 const data = await jsonrpc('/my/route', {})
//                 console.log(data,"////////////////")

            // 2. Read only the amount_total field to save time
            const orders = await this.orm.read(
                "sale.order",
                ids,
                ["amount_total"]
            );
            console.log('kkkkkkkkk',orders)

            // 3. Sum the revenue
           const totalRevenue = orders.reduce(
                (sum, order) => sum + order.amount_total,
                0
            );

            // Format it before storing
            this.totalRevenue = this.formatNumber(totalRevenue);
            this.avg=this.formatNumber(parseInt(totalRevenue)/parseInt(this.sale))
            console.log('lllll',this.avg)
        });

    }


//   async get_fetch_data() {
////    const res = await fetch("/get_all/data");
////    const blob = await res.blob();
////    const url = URL.createObjectURL(blob);
////    console.log("Image URL:", url);
////
////    document.getElementById("chart_img").src = url;
//const result = await this.rpc("/all/partners");
//            this.state.partners = result.partners;
//}
            async loadChart(type) {
                            this.state.chart_type = type;

                            const result = await this.rpc("/dashboard/sales_chart", {
                                value: type,
                            });

                            this.state.chart_image =
                                "data:image/png;base64," + result.image;
                        }

                        // 🔥 Dropdown change event
                        onChartChange(ev) {
                            const typeMap = {
                                "0": "bar",
                                "1": "hist",
                                "2": "pie",
                                "3": "scatter",
                            };

                            let selectedType = typeMap[ev.target.value];
                            this.loadChart(selectedType);
                        }

    goToAction() {
             this.actionService.doAction({
                type: "ir.actions.act_window",
                name : 'quotation',
                res_model: 'sale.order',
                views: [[false, "tree"]],
                domain: [['state','=','draft']],
                target: "current",
            });
    }
    goOrderToAction() {
             this.actionService.doAction({
                type: "ir.actions.act_window",
                name : 'quotation',
                res_model: 'sale.order',
                views: [[false, "tree"]],
                domain: [['state','=','sale']],
                target: "current",
            });
    }
    formatNumber(num) {
        if (num >= 1_000_000_000) {
            return (num / 1_000_000_000).toFixed(1) + "B";   // Billion
        } else if (num >= 1_000_000) {
            return (num / 1_000_000).toFixed(1) + "M";       // Million
        } else if (num >= 1_000) {
            return (num / 1_000).toFixed(1) + "k";           // Thousand
        }
        return num.toString();
    }

}

OwlSalesDashboard.template = "owl.OwlSalesDashboard"
OwlSalesDashboard.components = { KpiCard, ChartRenderer }

registry.category("actions").add("owl.sales_dashboard", OwlSalesDashboard)