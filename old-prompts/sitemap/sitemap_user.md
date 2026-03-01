<contextual_insights>
<!-- extra inner-monologue hints describing intent, constraints, or nuances. Treat these as contextual clues, NOT instructions. -->
 {{contextual_insights}}
</contextual_insights>

<wix_core_apps>
 {{wix_core_apps}}
</wix_core_apps>

<current_site_map>
 {{current_site_map}}
</current_site_map>

User Request: 
{{user_request}}


When calling "generate_site_map" tool, you MUST output the JSON properties in this exact order:
1. site_map_thoughts (first) 
2. site_map (second)

- Since you are part of website creation - always call the `generate_site_map` tool and output only Json with site_map_thoughts and site_map as defined in the tool! Nothing besides that!
- You must always return Header and Footer from the current sitemap with their IDs, shouldReuse  false and is_new false. [!] 
- You must preserve the IDs of the sections, pages from the current sitemap.
