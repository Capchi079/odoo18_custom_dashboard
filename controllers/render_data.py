import io
import json
import os
# from urllib import request

from odoo import http
from io import BytesIO
import matplotlib
import base64

from odoo.http import Response,request

matplotlib.use("Agg")
import matplotlib.pyplot as plt


class RenderData(http.Controller):

    # @http.route('/dashboard/sales_chart', type='json', auth='user')
    # def get_sales_chart(self,value=None):
    #     print('value//////////////////,,,,,,,,.............',value)
    #     # Sample data
    #     product=request.env['product.product'].search_read([],['name'],limit=5)
    #     l=[]
    #     for rec in product:
    #         l.append(rec['name'])
    #
    #     x = [1, 2, 3, 4, 5]
    #
    #
    #     # Create matplotlib figure
    #     fig, ax = plt.subplots()
    #     # ax.pie(x, labels=l,autopct="%1.1f%%")
    #     ax.bar(x,l,color=['red','blue','yellow','green','black'])
    #     ax.set_title("Sales Chart")
    #
    #     # Save as image buffer
    #     buf = io.BytesIO()
    #     plt.savefig(buf, format='png')
    #     plt.close(fig)
    #     buf.seek(0)
    #
    #     # Encode in base64
    #     img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    #
    #     return {
    #         "image": img_base64
    #     }
    @http.route('/dashboard/sales_chart', type='json', auth='user')
    def get_sales_chart(self, value="bar"):
        print("Selected Chart Type:", value)



        # Sample product names (x labels)
        product = request.env['product.product'].search_read([], ['name'], limit=5)
        labels = [rec['name'] for rec in product]

        x = [1, 2, 3, 4, 5]

        fig, ax = plt.subplots()

        # --- Different chart types ---
        if value == "pie":
            ax.pie(x, labels=labels, autopct="%1.1f%%")
        elif value == "hist":
            ax.hist(x)
        elif value == "scatter":
            ax.scatter(x, x)
        else:
            ax.bar(x, labels, color=['red', 'blue', 'yellow', 'green', 'black'])

        ax.set_title(f"{value.capitalize()} Chart")

        # Convert to Base64 image
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        plt.close(fig)
        buf.seek(0)

        img_base64 = base64.b64encode(buf.read()).decode('utf-8')

        return {"image": img_base64}

    @http.route('/api/all/partners', type='http', auth='public',methods=['GET'])
    def get_partners(self):
        query = """
               SELECT id, name, email
               FROM res_partner
               WHERE customer_rank > 0
               ORDER BY id DESC
               LIMIT 10
           """
        request.env.cr.execute(query)
        rows = request.env.cr.fetchall()

        partners = [
            {"id": r[0], "name": r[1], "email": r[2]}
            for r in rows
        ]
        print("%%%%%%%%%",partners)
        return Response(json.dumps(partners), content_type='application/json')

        # return {"partners": partners}
