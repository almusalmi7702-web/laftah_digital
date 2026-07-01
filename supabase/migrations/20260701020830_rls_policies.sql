-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Public read policies for published content
CREATE POLICY "public_read_service_categories" ON service_categories
  FOR SELECT TO anon, authenticated USING (is_published = TRUE);

CREATE POLICY "public_read_services" ON services
  FOR SELECT TO anon, authenticated USING (is_published = TRUE);

CREATE POLICY "public_read_portfolio_items" ON portfolio_items
  FOR SELECT TO anon, authenticated USING (is_published = TRUE);

CREATE POLICY "public_read_portfolio_images" ON portfolio_images
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM portfolio_items WHERE portfolio_items.id = portfolio_images.portfolio_id AND portfolio_items.is_published = TRUE));

CREATE POLICY "public_read_pricing_plans" ON pricing_plans
  FOR SELECT TO anon, authenticated USING (is_published = TRUE);

CREATE POLICY "public_read_faqs" ON faqs
  FOR SELECT TO anon, authenticated USING (is_published = TRUE);

-- Admin read policy for admin_users
CREATE POLICY "admin_read_admin_users" ON admin_users
  FOR SELECT TO authenticated USING (is_admin());

-- Admin full access policies
CREATE POLICY "admin_all_service_categories" ON service_categories
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_services" ON services
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_portfolio_items" ON portfolio_items
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_portfolio_images" ON portfolio_images
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_pricing_plans" ON pricing_plans
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admin_all_faqs" ON faqs
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());