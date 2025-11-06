-- Create dish option groups table
CREATE TABLE public.dish_option_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dish_id UUID NOT NULL REFERENCES public.dishes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT false,
  allow_multiple BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dish options table
CREATE TABLE public.dish_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  option_group_id UUID NOT NULL REFERENCES public.dish_option_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier NUMERIC NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add options_selected column to order_items to store selected options as JSON
ALTER TABLE public.order_items 
ADD COLUMN options_selected JSONB DEFAULT '[]'::jsonb;

-- Enable RLS
ALTER TABLE public.dish_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dish_options ENABLE ROW LEVEL SECURITY;

-- RLS policies for dish_option_groups
CREATE POLICY "Anyone can view option groups"
ON public.dish_option_groups
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage option groups"
ON public.dish_option_groups
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- RLS policies for dish_options
CREATE POLICY "Anyone can view options"
ON public.dish_options
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage options"
ON public.dish_options
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_dish_option_groups_dish_id ON public.dish_option_groups(dish_id);
CREATE INDEX idx_dish_options_option_group_id ON public.dish_options(option_group_id);