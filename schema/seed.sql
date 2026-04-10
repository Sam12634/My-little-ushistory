-- ============================================================
-- My-little-ushistory - Seed Data
-- Inserts base elements, first-tier elements, second-tier elements,
-- and all combination recipes.
-- ============================================================


-- ============================================================
-- 1. BASE ELEMENTS (Tier 0)
-- ============================================================

insert into elements (element_name, tier, description) values
('Government', 0, 'Systems of rules, laws, and political structures'),
('Economy', 0, 'Production, trade, and financial systems'),
('Society/People', 0, 'Groups, communities, and social structures'),
('Geography/Resources', 0, 'Land, climate, and natural resources'),
('Technology', 0, 'Tools, inventions, and innovations'),
('Conflict/War', 0, 'Armed struggles and major conflicts'),
('Reform/Ideals', 0, 'Movements for change and core beliefs'),
('Expansion/Movement', 0, 'Migration, growth, and territorial change'),
('Foreign Policy', 0, 'Relations with other nations'),
('Culture/Ideas', 0, 'Arts, beliefs, and cultural expression');


-- ============================================================
-- 2. FIRST-TIER ELEMENTS (Tier 1)
-- ============================================================

insert into elements (element_name, tier, description) values
('Constitution', 1, 'Foundational document establishing U.S. government'),
('Louisiana Purchase', 1, 'Territorial expansion under Jefferson'),
('Industrial Revolution', 1, 'Shift to machines, factories, and mass production'),
('Civil War', 1, 'Conflict between Union and Confederacy'),
('Bill of Rights', 1, 'First ten amendments protecting freedoms'),
('World War II', 1, 'Global conflict involving the U.S. from 1941–1945'),
('Transcontinental Railroad', 1, 'Railroad connecting the U.S. coast to coast'),
('New Deal', 1, 'FDR’s programs to fight the Great Depression'),
('Monroe Doctrine', 1, 'Policy opposing European interference in the Americas'),
('Harlem Renaissance', 1, 'Cultural movement centered in Harlem'),
('Mexican-American War', 1, 'Conflict leading to major territorial gains'),
('Agricultural South', 1, 'Economy based on farming and plantations'),
('Draft', 1, 'Government system for military conscription'),
('Mass Media', 1, 'Newspapers, radio, and early broadcast media'),
('NAFTA', 1, 'Trade agreement between U.S., Canada, and Mexico');


-- ============================================================
-- 3. FIRST-TIER COMBINATIONS
-- ============================================================

insert into combinations (element_a_id, element_b_id, result_id, notes)
select a.element_id, b.element_id, r.element_id,
       'Base combination creating a first-tier historical event'
from elements a, elements b, elements r
where
    (a.element_name, b.element_name, r.element_name) in (
        ('Government', 'Society/People', 'Constitution'),
        ('Geography/Resources', 'Expansion/Movement', 'Louisiana Purchase'),
        ('Technology', 'Economy', 'Industrial Revolution'),
        ('Conflict/War', 'Society/People', 'Civil War'),
        ('Government', 'Reform/Ideals', 'Bill of Rights'),
        ('Foreign Policy', 'Conflict/War', 'World War II'),
        ('Technology', 'Expansion/Movement', 'Transcontinental Railroad'),
        ('Economy', 'Reform/Ideals', 'New Deal'),
        ('Government', 'Foreign Policy', 'Monroe Doctrine'),
        ('Culture/Ideas', 'Society/People', 'Harlem Renaissance'),
        ('Conflict/War', 'Expansion/Movement', 'Mexican-American War'),
        ('Geography/Resources', 'Economy', 'Agricultural South'),
        ('Government', 'Conflict/War', 'Draft'),
        ('Technology', 'Culture/Ideas', 'Mass Media'),
        ('Foreign Policy', 'Economy', 'NAFTA')
    );


-- ============================================================
-- 4. SECOND-TIER ELEMENTS (Tier 2)
-- ============================================================

insert into elements (element_name, tier, description) values
('Three Branches', 2, 'Legislative, Executive, Judicial'),
('Voting Rights', 2, 'Expansion of suffrage over time'),
('Urbanization', 2, 'Growth of cities and population shifts'),
('Labor Unions', 2, 'Worker organizations for rights and protections'),
('Reconstruction', 2, 'Rebuilding the South after the Civil War'),
('Abolition of Slavery', 2, 'End of slavery through the 13th Amendment'),
('Civil Liberties Debate', 2, 'Rights vs. security during wartime'),
('Manifest Destiny', 2, 'Belief in U.S. expansion across the continent'),
('National Market', 2, 'Unified economic system across the U.S.'),
('Jazz Age', 2, 'Cultural era of jazz and modernism'),
('Social Security', 2, 'New Deal program for retirement security'),
('Atomic Age', 2, 'Era defined by nuclear technology'),
('Gold Rush', 2, 'Mass migration to California for gold'),
('Pop Culture', 2, 'Mass entertainment and cultural trends'),
('Globalization', 2, 'Worldwide economic and cultural integration');


-- ============================================================
-- 5. SECOND-TIER COMBINATIONS
-- ============================================================

insert into combinations (element_a_id, element_b_id, result_id, notes)
select a.element_id, b.element_id, r.element_id,
       'First-tier + base element creating a second-tier concept'
from elements a, elements b, elements r
where
    (a.element_name, b.element_name, r.element_name) in (
        ('Constitution', 'Government', 'Three Branches'),
        ('Constitution', 'Society/People', 'Voting Rights'),
        ('Industrial Revolution', 'Expansion/Movement', 'Urbanization'),
        ('Industrial Revolution', 'Society/People', 'Labor Unions'),
        ('Civil War', 'Government', 'Reconstruction'),
        ('Civil War', 'Reform/Ideals', 'Abolition of Slavery'),
        ('Bill of Rights', 'Conflict/War', 'Civil Liberties Debate'),
        ('Monroe Doctrine', 'Expansion/Movement', 'Manifest Destiny'),
        ('Transcontinental Railroad', 'Economy', 'National Market'),
        ('Harlem Renaissance', 'Culture/Ideas', 'Jazz Age'),
        ('New Deal', 'Economy', 'Social Security'),
        ('World War II', 'Technology', 'Atomic Age'),
        ('Mexican-American War', 'Geography/Resources', 'Gold Rush'),
        ('Mass Media', 'Society/People', 'Pop Culture'),
        ('NAFTA', 'Economy', 'Globalization')
    );

-- ============================================================
-- END OF SEED FILE
-- ============================================================
